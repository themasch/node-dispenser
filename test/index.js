var assert = require('assert')
var injector = require('../lib/injector.js')

describe('injector', function() {

    describe('register', function() {
        it('should be able to register a skalar value', function() {
            var value = 42;
            injector.register('value', value);

            assert.equal(injector.registry['value'], value)
        })

        it('should be able to register a callable', function() {
            var value = function() { return 42; };
            injector.register('value', value);

            assert.equal(injector.registry['value'], value)
        })
    })

    describe('factory(name, cb)', function() {
        it('should support factorys with zero parameters', function() {
            var cb = function() { return 42 };
            var parameters = [];

            injector.factory('fact', cb)
            assert.equal(injector.factories['fact'], cb)
            assert.deepEqual(
                injector.factories['fact'].$inject, parameters
            );
        })
        it('should support factorys with one parameter', function() {
            var cb = function(one) { return 42 };
            var parameters = ['one'];

            injector.factory('fact', cb)
            assert.equal(injector.factories['fact'], cb)
            assert.deepEqual(
                injector.factories['fact'].$inject, parameters
            );
        })
        it('should support factorys with multiple parameter', function() {
            var cb = function(nothin, $somethin, all) { return 42 };
            var parameters = ['nothin', '$somethin', 'all'];

            injector.factory('fact', cb)
            assert.equal(injector.factories['fact'], cb)
            assert.deepEqual(
                injector.factories['fact'].$inject, parameters
            );
        })
        it('should parse named functions', function() {
            var cb = function asdf(nothin, all) { /*function asd(stuff)*/ return 42 };
            var parameters = ['nothin', 'all'];

            injector.factory('fact', cb)
            assert.equal(injector.factories['fact'], cb)
            assert.deepEqual(
                injector.factories['fact'].$inject, parameters
            );
        })
        it('should ignore comments', function() {
            var cb = function /*name*/(nothin/*, $somethin*/, all) { /*function(stuff)*/ return 42 };
            var parameters = ['nothin', 'all'];

            injector.factory('fact', cb)
            assert.equal(injector.factories['fact'], cb)
            assert.deepEqual(
                injector.factories['fact'].$inject, parameters
            );
        })
    })

    describe('factory(name, params, cb)', function() {
        it('should support factorys with zero parameters', function() {
            var cb = function() { return 42 };
            var parameters = [];

            injector.factory('fact', parameters, cb)
            assert.equal(injector.factories['fact'], cb)
            assert.deepEqual(
                injector.factories['fact'].$inject, parameters
            );
        })
        it('should support factorys with one parameter', function() {
            var cb = function() { return 42 };
            var parameters = ['nothin'];

            injector.factory('fact', parameters, cb)
            assert.equal(injector.factories['fact'], cb)
            assert.deepEqual(
                injector.factories['fact'].$inject, parameters
            );
        })
        it('should support factorys with multiple parameter', function() {
            var cb = function() { return 42 };
            var parameters = ['nothin', 'somethin', 'all'];

            injector.factory('fact', parameters, cb)
            assert.equal(injector.factories['fact'], cb)
            assert.deepEqual(
                injector.factories['fact'].$inject, parameters
            );
        })
    })

    describe('factory(name, params, cb, true)', function() {
        it('should support factorys with zero parameters', function() {
            var cb = function(done) { process.nextTick(function() {  done(42); } ); };
            var parameters = [];

            injector.factory('fact', parameters, cb, true)
            assert.equal(injector.factories['fact'], cb)
            assert.deepEqual(
                injector.factories['fact'].$inject, parameters
            );
            assert.equal(
                injector.factories['fact'].$async, true
            );
        })
        it('should support factorys with multiple parameter', function() {
            var cb = function(n, s, a, done) { process.nextTick(function() {  done(42); } ); };
            var parameters = ['nothin', 'somethin', 'all'];

            injector.factory('fact', parameters, cb, true)
            assert.equal(injector.factories['fact'], cb)
            assert.deepEqual(
                injector.factories['fact'].$inject, parameters
            );
            assert.equal(
                injector.factories['fact'].$async, true
            );
        })
    })

    describe('factory(name, cb, true)', function() {
        it('should support factorys with zero parameters', function() {
            var cb = function(done) { process.nextTick(function() {  done(42); } ); };
            var parameters = [];

            injector.factory('fact', cb, true)
            assert.equal(injector.factories['fact'], cb)
            assert.deepEqual(
                injector.factories['fact'].$inject, parameters
            );
            assert.equal(
                injector.factories['fact'].$async, true
            );
        })
        it('should support factorys with multiple parameter', function() {
            var cb = function(nothin, somethin, all, done) { process.nextTick(function() {  done(42); } ); };
            var parameters = ['nothin', 'somethin', 'all'];

            injector.factory('fact', cb, true)
            assert.equal(injector.factories['fact'], cb)
            assert.deepEqual(
                injector.factories['fact'].$inject, parameters
            );
            assert.equal(
                injector.factories['fact'].$async, true
            );
        })
    })

    describe('inject(cb)', function() {
        injector.register('inj_b_a', 42);
        injector.register('inj_b_b', 23);
        injector.factory('inj_b_c', function(a, b) {
            return a+b;
        })
        injector.factory('inj_b_async_c', function(a, b, done) {
            process.nextTick(function() {
                done(null, a+b)
            });
        }, true)

        it('should work with a service', function() {
            injector.inject(function(inj_b_a) {
                assert.equal(inj_b_a, 42);
            })
        })

        it('should work with a factory', function() {
            injector.inject(function(inj_b_c) {
                assert.equal(inj_b_c, 65);
            })
        })

        it('should work with an async factory', function(done) {
            injector.inject(function(inj_b_async_c) {
                assert.equal(inj_b_async_c, 65);
                done();
            })
        })
    })

    describe('inject(services, cb)', function() {
        injector.register('inj_a_a', 42);
        injector.register('inj_a_b', 23);
        injector.factory('inj_a_c', function(a, b) {
            return a+b;
        })
        injector.factory('inj_a_async_c', function(a, b, done) {
            process.nextTick(function() {
                done(null, a+b)
            });
        }, true)

        it('should work with a service', function() {
            injector.inject(['inj_a_a'], function(soma) {
                assert.equal(soma, 42);
            })
        })

        it('should work with a factory', function() {
            injector.inject(['inj_a_c'], function(soma) {
                assert.equal(soma, 65);
            })
        })

        it('should work with an async factory', function(done) {
            injector.inject(['inj_a_async_c'], function(soma) {
                assert.equal(soma, 65);
                done();
            })
        })
    })

    describe('getService(name, cb(err, [services]))', function() {
        injector.register('a', 42);
        injector.register('b', 23);
        injector.factory('c', function(a, b) {
            return a+b;
        })
        injector.factory('async_c', function(a, b, done) {
            process.nextTick(function() {
                done(null, a+b)
            });
        }, true)

        it('should work sync. for static services', function() {
            var tmp = null;
            injector.getService('a', function(err, services) {
                assert.equal(err, null);
                tmp = services[0];
                assert.equal(services[0], 42)
            })
            assert.equal(tmp, 42);
        })

        it('should work sync. for sync. factories', function() {
            var tmp = null;
            injector.getService('c', function(err, services) {
                assert.equal(err, null);
                tmp = services[0];
                assert.equal(services[0], 42+23)
            })
            assert.equal(tmp, 42+23);
        })

        it('should work async. for async. factories', function(done) {
            injector.getService('async_c', function(err, services) {
                assert.equal(err, null);
                assert.equal(services[0], 42+23)
                done();
            })
        })
    })
})
