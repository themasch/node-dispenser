var util = require('util')
  , asyc = require('async')
  , debug = require('debug')('injector')

var inj = {}
inj.registry = {}
inj.factories = {}

inj.register = function(name, service) {
    inj.registry[name] = service
}

inj.factory = function(name, dependencies, callback, async) {


    if(typeof dependencies === 'function') {
        async = callback
        callback = dependencies
        if(!callback.$inject) {
            dependencies = parseArgumentNames(callback)
            if(dependencies === false) {
                throw new Error('cant parse arugments names')
            }
            // throw away last argument (callback)
            if(async === true) {
                dependencies.pop();
            }
        }
    }
    callback.$inject = dependencies
    callback.$async  = (async === true)
    debug('+factory', name);
    inj.factories[name] = callback
}

inj.inject = function(deps, service) {
    if(service === undefined) {
        service = deps;
        deps = parseArgumentNames(service)
        if(deps === false) {
            throw new Error('cant parse arugments names')
        }
    }
    inj.get(deps, function(err, result) {
        debug('inject->get->', err, result);
        service.apply(null, result)
    })
}

inj.get = function(services, cb) {
    debug('GET', services);
    var onReady = function(err, objs) {
        debug('onReady', services, err, objs);
        if(objs.$injArr) {
            objs.unshift(null)
            delete objs.$injArr
        } else {
            objs = [null, objs]
        }
        debug('cb.apply', null, objs);
        cb.apply(null, objs)
    }
    if(!util.isArray(services)) {
       services = [services]
    }
    if(services.length === 0) {
        return cb(null, [])
    }
    debug('get array', services)

    var calls = services.map(function(name) {
        return function(cb) {
            debug('inj.get(', this.name, ')')
            inj.getService(this.name, cb)
        }.bind({name: name})
    })

    return asyc.parallel(calls, function(err, results) {
        var collected = []
        results.forEach(function(res) {
            if(util.isArray(res) && res.$injArr) {
                res.forEach(function(a) {
                    collected.push(a)
                })
            } else {
                collected.push(res)
            }
        })
        debug('parallel', err, collected)
        onReady(err, collected)
    })
}

inj.getService = function(serviceName, callback)
{
    serviceName = serviceName.trim()
    callback = callback || function() {}
    if(inj.registry[serviceName]) {
        debug('registry', serviceName)
        var ret = [inj.registry[serviceName]]
        ret.$injArr = true;
        return callback(null, ret)
    }
    if(!inj.factories[serviceName]) {
        throw new Error('service not found "' + serviceName + '"')
    }
    inj.instanciate(serviceName, callback)
}

inj.instanciate = function(serviceName, callback)
{
    var onReady = function(err, service) {
        debug('onReady:', serviceName, service);
        if(!err) {
            inj.registry[serviceName] = service;
        }
        service = [service]
        service.$injArr = true
        callback(err, service)
    }
    var factory = inj.factories[serviceName];
    debug('factory', serviceName, 'toInject:', factory.$inject)
    inj.get(factory.$inject, function(err, deps) {
        if(factory.$async) {
            deps.push(onReady)
            debug('factory=>', serviceName, err, deps)
            return factory.apply(null, deps)
        } else {
            debug('factory->', serviceName, err, deps)
            var data = factory.apply(null, deps)
            debug('factory>onReady', data)
            return onReady(null, data)
        }
    })
}

var parseArgumentNames = function(func) {
    var FN_ARGS = /^function\s*[^\(]*\s*\(\s*([^\)]*)\)/m
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg
    var src = func.toString()
    src = src.replace(STRIP_COMMENTS, '')
    var matches = src.match(FN_ARGS)
    if(matches == null || matches.length < 2) {
        return false;
    }
    var args = matches[1].replace(/\s/g, '').split(',').filter(function(arg) {
        return arg.trim().length > 0;
    });
    return args;

}

module.exports = inj;
