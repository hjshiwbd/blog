@echo off
%1 mshta vbscript:CreateObject("Shell.Application").ShellExecute("cmd.exe","/c %~s0 ::","","runas",1)(window.close)&&exit
net start mysql80


::npm run start
call pm2 start G:\git\github\blog\bin\www --name t66y -- --mode local

ping -n 10 127.0.0.1 > nul

start http://localhost:3000/
