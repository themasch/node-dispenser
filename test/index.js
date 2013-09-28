var assert = require('assert')
var dispenser = require('../lib/dispenser.js')

describe('dispenser', function() {

    describe('register', function() {
        it('should be able to register a skalar value', function() {
            var value = 42;
            dispenser.register('value', value);

            assert.equal(dispenser.registry['value'], value)
        })

        it('should be able to register a callable', function() {
            var value = function() { return 42; };
            dispenser.register('value', value);

            assert.equal(dispenser.registry['value'], value)
        })
    })

    describe('factory(name, cb)', function() {
        it('should support factorys with zero parameters', function() {
            var cb = function() { return 42 };
            var parameters = [];

            dispenser.factory('fact', cb)
            assert.equal(dispenser.factories['fact'], cb)
            assert.deepEqual(
                dispenser.factories['fact'].$inject, parameters
            );
        })
        it('should support factorys with one parameter', function() {
            var cb = function(one) { return 42 };
            var parameters = ['one'];

            dispenser.factory('fact', cb)
            assert.equal(dispenser.factories['fact'], cb)
            assert.deepEqual(
                dispenser.factories['fact'].$inject, parameters
            );
        })
        it('should support factorys with multiple parameter', function() {
            var cb = function(nothin, $somethin, all) { return 42 };
            var parameters = ['nothin', '$somethin', 'all'];

            dispenser.factory('fact', cb)
            assert.equal(dispenser.factories['fact'], cb)
            assert.deepEqual(
                dispenser.factories['fact'].$inject, parameters
            );
        })
        it('should parse named functions', function() {
            var cb = function asdf(nothin, all) { /*function asd(stuff)*/ return 42 };
            var parameters = ['nothin', 'all'];

            dispenser.factory('fact', cb)
            assert.equal(dispenser.factories['fact'], cb)
            assert.deepEqual(
                dispenser.factories['fact'].$inject, parameters
            );
        })
        it('should ignore comments', function() {
            var cb = function /*name*/(nothin/*, $somethin*/, all) { /*function(stuff)*/ return 42 };
            var parameters = ['nothin', 'all'];

            dispenser.factory('fact', cb)
            assert.equal(dispenser.factories['fact'], cb)
            assert.deepEqual(
                dispenser.factories['fact'].$inject, parameters
            );
        })
    })

    describe('factory(name, params, cb)', function() {
        it('should support factorys with zero parameters', function() {
            var cb = function() { return 42 };
            var parameters = [];

            dispenser.factory('fact', parameters, cb)
            assert.equal(dispenser.factories['fact'], cb)
            assert.deepEqual(
                dispenser.factories['fact'].$inject, parameters
            );
        })
        it('should support factorys with one parameter', function() {
            var cb = function() { return 42 };
            var parameters = ['nothin'];

            dispenser.factory('fact', parameters, cb)
            assert.equal(dispenser.factories['fact'], cb)
            assert.deepEqual(
                dispenser.factories['fact'].$inject, parameters
            );
        })
        it('should support factorys with multiple parameter', function() {
            var cb = function() { return 42 };
            var parameters = ['nothin', 'somethin', 'all'];

            dispenser.factory('fact', parameters, cb)
            assert.equal(dispenser.factories['fact'], cb)
            assert.deepEqual(
                dispenser.factories['fact'].$inject, parameters
            );
        })
    })

    describe('factory(name, params, cb, true)', function() {
        it('should support factorys with zero parameters', function() {
            var cb = function(done) { process.nextTick(function() {  done(42); } ); };
            var parameters = [];

            dispenser.factory('fact', parameters, cb, true)
            assert.equal(dispenser.factories['fact'], cb)
            assert.deepEqual(
                dispenser.factories['fact'].$inject, parameters
            );
            assert.equal(
                dispenser.factories['fact'].$async, true
            );
        })
        it('should support factorys with multiple parameter', function() {
            var cb = function(n, s, a, done) { process.nextTick(function() {  done(42); } ); };
            var parameters = ['nothin', 'somethin', 'all'];

            dispenser.factory('fact', parameters, cb, true)
            assert.equal(dispenser.factories['fact'], cb)
            assert.deepEqual(
                dispenser.factories['fact'].$inject, parameters
            );
            assert.equal(
                dispenser.factories['fact'].$async, true
            );
        })
    })

    describe('factory(name, cb, true)', function() {
        it('should support factorys with zero parameters', function() {
            var cb = function(done) { process.nextTick(function() {  done(42); } ); };
            var parameters = [];

            dispenser.factory('fact', cb, true)
            assert.equal(dispenser.factories['fact'], cb)
            assert.deepEqual(
                dispenser.factories['fact'].$inject, parameters
            );
            assert.equal(
                dispenser.factories['fact'].$async, true
            );
        })
        it('should support factorys with multiple parameter', function() {
            var cb = function(nothin, somethin, all, done) { process.nextTick(function() {  done(42); } ); };
            var parameters = ['nothin', 'somethin', 'all'];

            dispenser.factory('fact', cb, true)
            assert.equal(dispenser.factories['fact'], cb)
            assert.deepEqual(
                dispenser.factories['fact'].$inject, parameters
            );
            assert.equal(
                dispenser.factories['fact'].$async, true
            );
        })
    })

    describe('inject(cb)', function() {
        dispenser.register('inj_b_a', 42);
        dispenser.register('inj_b_b', 23);
        dispenser.factory('inj_b_c', function(a, b) {
            return a+b;
        })
        dispenser.factory('inj_b_async_c', function(a, b, done) {
            process.nextTick(function() {
                done(null, a+b)
            });
        }, true)

        it('should work with a service', function() {
            dispenser.inject(function(inj_b_a) {
                assert.equal(inj_b_a, 42);
            })
        })

        it('should work with a factory', function() {
            dispenser.inject(function(inj_b_c) {
                assert.equal(inj_b_c, 65);
            })
        })

        it('should work with an async factory', function(done) {
            dispenser.inject(function(inj_b_async_c) {
                assert.equal(inj_b_async_c, 65);
                done();
            })
        })
    })

    describe('inject(services, cb)', function() {
        dispenser.register('inj_a_a', 42);
        dispenser.register('inj_a_b', 23);
        dispenser.factory('inj_a_c', function(a, b) {
            return a+b;
        })
        dispenser.factory('inj_a_async_c', function(a, b, done) {
            process.nextTick(function() {
                done(null, a+b)
            });
        }, true)

        it('should work with a service', function() {
            dispenser.inject(['inj_a_a'], function(soma) {
                assert.equal(soma, 42);
            })
        })

        it('should work with a factory', function() {
            dispenser.inject(['inj_a_c'], function(soma) {
                assert.equal(soma, 65);
            })
        })

        it('should work with an async factory', function(done) {
            dispenser.inject(['inj_a_async_c'], function(soma) {
                assert.equal(soma, 65);
                done();
            })
        })
    })

    describe('getService(name, cb(err, [services]))', function() {
        dispenser.register('a', 42);
        dispenser.register('b', 23);
        dispenser.factory('c', function(a, b) {
            return a+b;
        })
        dispenser.factory('async_c', function(a, b, done) {
            process.nextTick(function() {
                done(null, a+b)
            });
        }, true)

        it('should work sync. for static services', function() {
            var tmp = null;
            dispenser.getService('a', function(err, services) {
                assert.equal(err, null);
                tmp = services[0];
                assert.equal(services[0], 42)
            })
            assert.equal(tmp, 42);
        })

        it('should work sync. for sync. factories', function() {
            var tmp = null;
            dispenser.getService('c', function(err, services) {
                assert.equal(err, null);
                tmp = services[0];
                assert.equal(services[0], 42+23)
            })
            assert.equal(tmp, 42+23);
        })

        it('should work async. for async. factories', function(done) {
            dispenser.getService('async_c', function(err, services) {
                assert.equal(err, null);
                assert.equal(services[0], 42+23)
                done();
            })
        })
    })
})
