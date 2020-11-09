module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = require('../../ssr-module-cache.js');
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./pages/api/upload.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./pages/api/upload.ts":
/*!*****************************!*\
  !*** ./pages/api/upload.ts ***!
  \*****************************/
/*! exports provided: config, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"config\", function() { return config; });\nconst S3 = __webpack_require__(/*! aws-sdk/clients/s3 */ \"aws-sdk/clients/s3\");\n\nconst multer = __webpack_require__(/*! multer */ \"multer\");\n\nconst upload = multer().single('soundBlob');\nconst s3 = new S3({\n  apiVersion: '2006-03-01'\n});\nconst config = {\n  api: {\n    bodyParser: false\n  }\n};\n/* harmony default export */ __webpack_exports__[\"default\"] = (async (req, res) => {\n  if (req.method === 'POST') {\n    return upload(req, res, async err => {\n      try {\n        await s3.upload({\n          Bucket: process.env.AWS_BUCKET,\n          Key: req.file.originalname,\n          Body: Buffer.from(new Uint8Array(req.file.buffer))\n        }, async (err, data) => {\n          if (err) {\n            console.log('error: ', err);\n            res.sendStatus(404);\n          }\n\n          res.send(`https://${process.env.AWS_BUCKET}/${escape(req.file.originalname)}`);\n        });\n      } catch (err) {\n        console.log(err);\n      }\n    });\n  }\n\n  res.end();\n});//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9wYWdlcy9hcGkvdXBsb2FkLnRzP2YzMDkiXSwibmFtZXMiOlsiUzMiLCJyZXF1aXJlIiwibXVsdGVyIiwidXBsb2FkIiwic2luZ2xlIiwiczMiLCJhcGlWZXJzaW9uIiwiY29uZmlnIiwiYXBpIiwiYm9keVBhcnNlciIsInJlcSIsInJlcyIsIm1ldGhvZCIsImVyciIsIkJ1Y2tldCIsInByb2Nlc3MiLCJlbnYiLCJBV1NfQlVDS0VUIiwiS2V5IiwiZmlsZSIsIm9yaWdpbmFsbmFtZSIsIkJvZHkiLCJCdWZmZXIiLCJmcm9tIiwiVWludDhBcnJheSIsImJ1ZmZlciIsImRhdGEiLCJjb25zb2xlIiwibG9nIiwic2VuZFN0YXR1cyIsInNlbmQiLCJlc2NhcGUiLCJlbmQiXSwibWFwcGluZ3MiOiJBQUFBO0FBQUE7QUFBQSxNQUFNQSxFQUFFLEdBQUdDLG1CQUFPLENBQUMsOENBQUQsQ0FBbEI7O0FBQ0EsTUFBTUMsTUFBTSxHQUFHRCxtQkFBTyxDQUFDLHNCQUFELENBQXRCOztBQUNBLE1BQU1FLE1BQU0sR0FBR0QsTUFBTSxHQUFHRSxNQUFULENBQWdCLFdBQWhCLENBQWY7QUFFQSxNQUFNQyxFQUFFLEdBQUcsSUFBSUwsRUFBSixDQUFPO0FBQUVNLFlBQVUsRUFBRTtBQUFkLENBQVAsQ0FBWDtBQUVPLE1BQU1DLE1BQU0sR0FBRztBQUNwQkMsS0FBRyxFQUFFO0FBQ0hDLGNBQVUsRUFBRTtBQURUO0FBRGUsQ0FBZjtBQU9RLHNFQUFPQyxHQUFQLEVBQVlDLEdBQVosS0FBb0I7QUFDakMsTUFBSUQsR0FBRyxDQUFDRSxNQUFKLEtBQWUsTUFBbkIsRUFBMkI7QUFDekIsV0FBT1QsTUFBTSxDQUFDTyxHQUFELEVBQU1DLEdBQU4sRUFBVyxNQUFPRSxHQUFQLElBQWU7QUFDckMsVUFBSTtBQUNGLGNBQU1SLEVBQUUsQ0FBQ0YsTUFBSCxDQUNKO0FBQ0VXLGdCQUFNLEVBQUVDLE9BQU8sQ0FBQ0MsR0FBUixDQUFZQyxVQUR0QjtBQUVFQyxhQUFHLEVBQUVSLEdBQUcsQ0FBQ1MsSUFBSixDQUFTQyxZQUZoQjtBQUdFQyxjQUFJLEVBQUVDLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZLElBQUlDLFVBQUosQ0FBZWQsR0FBRyxDQUFDUyxJQUFKLENBQVNNLE1BQXhCLENBQVo7QUFIUixTQURJLEVBTUosT0FBT1osR0FBUCxFQUFZYSxJQUFaLEtBQXFCO0FBQ25CLGNBQUliLEdBQUosRUFBUztBQUNQYyxtQkFBTyxDQUFDQyxHQUFSLENBQVksU0FBWixFQUF1QmYsR0FBdkI7QUFDQUYsZUFBRyxDQUFDa0IsVUFBSixDQUFlLEdBQWY7QUFDRDs7QUFFRGxCLGFBQUcsQ0FBQ21CLElBQUosQ0FDRyxXQUFVZixPQUFPLENBQUNDLEdBQVIsQ0FBWUMsVUFBVyxJQUFHYyxNQUFNLENBQ3pDckIsR0FBRyxDQUFDUyxJQUFKLENBQVNDLFlBRGdDLENBRXpDLEVBSEo7QUFLRCxTQWpCRyxDQUFOO0FBbUJELE9BcEJELENBb0JFLE9BQU9QLEdBQVAsRUFBWTtBQUNaYyxlQUFPLENBQUNDLEdBQVIsQ0FBWWYsR0FBWjtBQUNEO0FBQ0YsS0F4QlksQ0FBYjtBQXlCRDs7QUFFREYsS0FBRyxDQUFDcUIsR0FBSjtBQUNELENBOUJEIiwiZmlsZSI6Ii4vcGFnZXMvYXBpL3VwbG9hZC50cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFMzID0gcmVxdWlyZSgnYXdzLXNkay9jbGllbnRzL3MzJyk7XG5jb25zdCBtdWx0ZXIgPSByZXF1aXJlKCdtdWx0ZXInKTtcbmNvbnN0IHVwbG9hZCA9IG11bHRlcigpLnNpbmdsZSgnc291bmRCbG9iJyk7XG5cbmNvbnN0IHMzID0gbmV3IFMzKHsgYXBpVmVyc2lvbjogJzIwMDYtMDMtMDEnIH0pO1xuXG5leHBvcnQgY29uc3QgY29uZmlnID0ge1xuICBhcGk6IHtcbiAgICBib2R5UGFyc2VyOiBmYWxzZSxcbiAgfSxcbn07XG5cblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIGlmIChyZXEubWV0aG9kID09PSAnUE9TVCcpIHtcbiAgICByZXR1cm4gdXBsb2FkKHJlcSwgcmVzLCBhc3luYyAoZXJyKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBzMy51cGxvYWQoXG4gICAgICAgICAge1xuICAgICAgICAgICAgQnVja2V0OiBwcm9jZXNzLmVudi5BV1NfQlVDS0VULFxuICAgICAgICAgICAgS2V5OiByZXEuZmlsZS5vcmlnaW5hbG5hbWUsXG4gICAgICAgICAgICBCb2R5OiBCdWZmZXIuZnJvbShuZXcgVWludDhBcnJheShyZXEuZmlsZS5idWZmZXIpKSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGFzeW5jIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2Vycm9yOiAnLCBlcnIpO1xuICAgICAgICAgICAgICByZXMuc2VuZFN0YXR1cyg0MDQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXMuc2VuZChcbiAgICAgICAgICAgICAgYGh0dHBzOi8vJHtwcm9jZXNzLmVudi5BV1NfQlVDS0VUfS8ke2VzY2FwZShcbiAgICAgICAgICAgICAgICByZXEuZmlsZS5vcmlnaW5hbG5hbWVcbiAgICAgICAgICAgICAgKX1gXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmVzLmVuZCgpO1xufTtcbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./pages/api/upload.ts\n");

/***/ }),

/***/ "aws-sdk/clients/s3":
/*!*************************************!*\
  !*** external "aws-sdk/clients/s3" ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"aws-sdk/clients/s3\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJhd3Mtc2RrL2NsaWVudHMvczNcIj9lM2Q4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBIiwiZmlsZSI6ImF3cy1zZGsvY2xpZW50cy9zMy5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImF3cy1zZGsvY2xpZW50cy9zM1wiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///aws-sdk/clients/s3\n");

/***/ }),

/***/ "multer":
/*!*************************!*\
  !*** external "multer" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"multer\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJtdWx0ZXJcIj9hNzA0Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBIiwiZmlsZSI6Im11bHRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm11bHRlclwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///multer\n");

/***/ })

/******/ });