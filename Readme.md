- Run app 
  ```
  electron .
  ```

- Build app
	```
	npm install
	npm run pack
	```


- Created using electron builder
	- https://github.com/electron-userland/electron-builder

- Fix for loading external dependencies in html :
 ```
   <script>if (typeof module === 'object') {window.module = module; module = undefined;}</script>
   <!-- JS  dependecies -->
  <script>if (window.module) module = window.module;</script>

 ```