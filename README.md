# dispenser [![build status](https://secure.travis-ci.org/themasch/node-dispenser.png)](http://travis-ci.org/themasch/node-dispenser)

Another approach of IoC/Dependency Injection for JavaScript

## Install with [npm](http://npmjs.org)

currently not in npm (need a name, meh)

## Why?

Because I like the idea of IoC and I like JavaScript.

## Design and Ideas

Dispenser does not use magical getters or setters but offers some simple(?) functions to
register and retrieve services. Services can be configured using plain values or
by defining a factory which may consume other services.

Factorys are only executed once. They are usefull for lazy instanciating of services.
The factory is called when the service is requested for the first time. The result is
cached and this cache will be used for furter requests.

## Usage

```javascript
var dispenser = require( 'dispenser' )
```

### register a service

```javascript
dispenser.register('the_answer', 42)
```

### register a service via a factory

```javascript
dispenser.factory('give_answer', ['the_answer'], function(a) {
    return 'The answer to life the universe and everything is ' + a;
})
```

or use the short form

```javascript
dispenser.factory('give_answer', function(the_answer) {
    return 'The answer to life the universe and everything is ' + the_answer;
})
```

### retrieve a service

```javascript
dispenser.inject(['give_answer'], function(txt) {
    console.log(txt)
})
```

or use the short form

```javascript
dispenser.inject(function(give_answer) {
    console.log(give_answer)
})
```

### this works the same way for more complex data:

```javascript
dispenser.register('$config', require('./config'))

dispenser.factory('$dbm', function($config) {
    return DatabaseDriver.connect($config.db.uri)
})

function UserController($config, $dbm) {
    if(!(this instanceof UserController)) {
        return new UserController($config, $dbm)
    }
}

dispenser.factory('UsrCtrl', UserController)
```

## API

Thats what I'd call the "public API" of dispenser. It exposes some more functions but they aren't made for public use.

### dispenser.register(*name*, *value*)
 - `name` the services name
 - `value` the value you want to store as a service

### dispenser.factory(*name*[, *parameters*], *factory*[, *async*])
 - `name` the services name
 - `parameters` (*optional*) Array of service names to use as arguments for the factoy. If omited dispenser tries to parse these names from the factory source.
 - `factory` the factory function itself.
 - `async` (*optional*) defines if the factory function is asynchronus. Defaults to false, if true, the last parameter given to factory will be a callback(err, service)

### dispenser.inject([*parameters* ,] *function*)
  - `parameters` (*optional*) Array of service names to use as arguments for the function. If omited dispenser tries to parse these names from the functions source.
  - `function` the funciton that should be called with the services as arguments.


## The MIT License (MIT)

Copyright (c) 2013 Mark Schmale

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
