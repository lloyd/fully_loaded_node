(This repository complements the [chat we'll have in philly on april 23rd, 2012](http://node.ph).)

## Fully Loaded Node

Let's say you've got this web application you've written in node.js,
and it does some computation.  Let's also say you've some machines
with lots and lots of computational cores at your disposal.

What high level architecture should you apply to build a system that
can run really hot, leveraging all available processing cores, while
staying responsive, and have graceful fast-failures in times of
backbreaking load?

This talk in words and code walks you through several different possible
architectures, starting with something that works terribly, and ending
up with something that probably work good enough.

## The Real World Problem

All of this is motivated by the Persona service from Mozilla - a
distributed single sign-on system for the web.  This backend of this
service has a web api which exposes a couple dozen operations.  Some
of these operations (like setting or checking your password, or
signing certificates) can take a non-trivial amount of CPU time.  We
want the system to serve the highest possible number of simultaneous
users for the lowest cost, and balance that with strong security (it's
an authentication system, after all).

This system is compute bound, and has following constraints:

  * We must be able to use 100% of available CPUs during load.
  * Cheap operations should *always* be responsive.
  * Expensive operations should never take more than N seconds,
    else we should demonstrate a failure animal to the user rather
    than making them wait.

While the system itself is somewhat complex, the requirements above
can be explored with a much simpler representative application.

## The Representative Sub-Problem

The sample application that we'll iteratively refine to explore
these constrains does the following:

  * Has a web frontend that gives realtime updates of processor usage,
    system reponsiveness, throughput, and expensive operation wait-time.
  * This web frontend is real time updated via websockets by the same
    server that is being loaded.
  * This server exposes an api that can be hit to generate load, about
    500ms of load on a 2ghz processor.  Hitting the API causes a random
    string to be generated and then [bcrypted] with 12 rounds, which is
    about the cost of setting or checking a password.

  [bcrypt]: http://en.wikipedia.org/wiki/Bcrypt

The sample application is deployable on an EC2 instance.

## Round 1: Synchronicity

branch: `sync`

This version performs bcyrpt synchronously in the load API.

## Round 2: Async

branch: `async`

## Round 3: Coarse Multi-Processing

branch: `coarse`

## Round 4: Fine Grained Multi-Processing

branch: `fine`

## LICENSE

Everything you find here is rigorously protected under the [wtfpl][].

  [wtfpl]: http://wtfpl.org

