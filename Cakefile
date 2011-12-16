{spawn, exec} = require 'child_process'
sys = require 'sys'     
fs  = require 'fs'  
# stdout        = process.stdout
# stderr        = process.stderr

task 'watch', 'Watch source files and build JS & CSS', (options) ->
  runCommand = (name, args...) ->
    proc =           spawn name, args
    proc.stderr.on   'data', (buffer) -> console.log buffer.toString()
    proc.stdout.on   'data', (buffer) -> console.log buffer.toString()
    proc.on          'exit', (status) -> process.exit(1) if status isnt 0
  #runCommand 'sass',   ['--watch', 'public/css/sass:public/css']
  # runCommand 'coffee', '-wc', 'public/js', 'test-js'      
  
  runCommand 'coffee', '-wc', '-o', 'js/', 'coffeescript/' 
  
  # {exec} = require 'child_process'
# task 'watch', 'Build project from src/*.coffee to lib/*.js', ->       
  # console.log('starting')
  # exec 'coffee -wc --output web_rt_webapp/src/main/webapp/js/ web_rt_webapp/src/main/webapp/coffeescript/', (err, stdout, stderr) ->
  #   throw err if err
  #   console.log stdout + stderr 
  

# Alternately, compile CoffeeScript programmatically
# CoffeeScript = require "coffee-script"
# CoffeeScript.compile fs.readFileSync filename