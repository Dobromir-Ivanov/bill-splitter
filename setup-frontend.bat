@echo off
cd frontend
call npm install -g @angular/cli
call ng new bill-splitter-frontend --directory ./ --routing true --style scss --skip-git true
call npm install @angular/material @angular/cdk @angular/flex-layout
call npm install --save @angular/material-moment-adapter moment
call ng add @angular/material
call ng serve
