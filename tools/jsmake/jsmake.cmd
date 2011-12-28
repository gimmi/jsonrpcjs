@echo off
java -cp "%~dp0js.jar" org.mozilla.javascript.tools.shell.Main -modules "." "%~dp0bootstrap.js" "%~dp0jsmake.js" %*