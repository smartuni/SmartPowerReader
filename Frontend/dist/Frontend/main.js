(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "./src/$$_lazy_route_resource lazy recursive":
/*!**********************************************************!*\
  !*** ./src/$$_lazy_route_resource lazy namespace object ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(function() {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "./src/$$_lazy_route_resource lazy recursive";

/***/ }),

/***/ "./src/app/app-routing.module.ts":
/*!***************************************!*\
  !*** ./src/app/app-routing.module.ts ***!
  \***************************************/
/*! exports provided: AppRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppRoutingModule", function() { return AppRoutingModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _modules_home_pages_home_page_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./modules/home/pages/home-page.component */ "./src/app/modules/home/pages/home-page.component.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};



var routes = [
    { path: '', component: _modules_home_pages_home_page_component__WEBPACK_IMPORTED_MODULE_2__["HomePageComponent"] },
    { path: '*', component: _modules_home_pages_home_page_component__WEBPACK_IMPORTED_MODULE_2__["HomePageComponent"] },
    { path: '**', redirectTo: '' },
];
var AppRoutingModule = /** @class */ (function () {
    function AppRoutingModule() {
    }
    AppRoutingModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"])({
            imports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"].forRoot(routes)],
            exports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]]
        })
    ], AppRoutingModule);
    return AppRoutingModule;
}());



/***/ }),

/***/ "./src/app/app.component.html":
/*!************************************!*\
  !*** ./src/app/app.component.html ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<app-header xmlns=\"http://www.w3.org/1999/html\"></app-header>\n<main>\n  <router-outlet></router-outlet>\n</main>\n<app-footer></app-footer>\n\n\n<!-- Custom modal setup -->\n<div id=\"modal-wrapper\" class=\"modal-wrapper\">\n  <div id=\"modal-background\" class=\"modal-background\" (click)=\"closeModal()\" style=\"visibility: hidden\"></div>\n\n  <div class=\"d-flex align-items-center justify-content-center h-100 modal-subwrapper\">\n    <div id=\"modal-container\" style=\"visibility: hidden\">\n      <button type=\"button\" class=\"close\" (click)=\"closeModal()\">\n        <span aria-hidden=\"true\">&times;</span>\n      </button>\n    </div>\n  </div>\n</div>\n\n"

/***/ }),

/***/ "./src/app/app.component.scss":
/*!************************************!*\
  !*** ./src/app/app.component.scss ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/app.component.ts":
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/*! exports provided: AppComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComponent", function() { return AppComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _shared_services_modal_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./shared/services/modal.service */ "./src/app/shared/services/modal.service.ts");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var AppComponent = /** @class */ (function () {
    function AppComponent(modalService, router) {
        this.modalService = modalService;
        this.router = router;
        this.title = 'Smart Power Reader';
    }
    AppComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.router.events.subscribe(function (val) {
            _this.isOnHomepage = _this.router.url === '/';
        });
    };
    AppComponent.prototype.closeModal = function () {
        this.modalService.destroy();
    };
    AppComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-root',
            template: __webpack_require__(/*! ./app.component.html */ "./src/app/app.component.html"),
            styles: [__webpack_require__(/*! ./app.component.scss */ "./src/app/app.component.scss")]
        }),
        __metadata("design:paramtypes", [_shared_services_modal_service__WEBPACK_IMPORTED_MODULE_1__["ModalService"],
            _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"]])
    ], AppComponent);
    return AppComponent;
}());



/***/ }),

/***/ "./src/app/app.module.ts":
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/*! exports provided: AppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/platform-browser */ "./node_modules/@angular/platform-browser/fesm5/platform-browser.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app.component */ "./src/app/app.component.ts");
/* harmony import */ var core_footer_footer_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core/footer/footer.component */ "./src/app/core/footer/footer.component.ts");
/* harmony import */ var core_header_header_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core/header/header.component */ "./src/app/core/header/header.component.ts");
/* harmony import */ var _modules_home_components_edit_edit_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./modules/home/components/edit/edit.component */ "./src/app/modules/home/components/edit/edit.component.ts");
/* harmony import */ var _app_routing_module__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./app-routing.module */ "./src/app/app-routing.module.ts");
/* harmony import */ var _modules_home_home_module__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./modules/home/home.module */ "./src/app/modules/home/home.module.ts");
/* harmony import */ var _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/platform-browser/animations */ "./node_modules/@angular/platform-browser/fesm5/animations.js");
/* harmony import */ var _ngrx_store__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @ngrx/store */ "./node_modules/@ngrx/store/fesm5/store.js");
/* harmony import */ var _store_reducers__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./store/reducers */ "./src/app/store/reducers/index.ts");
/* harmony import */ var _ngrx_store_devtools__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @ngrx/store-devtools */ "./node_modules/@ngrx/store-devtools/fesm5/store-devtools.js");
/* harmony import */ var environments_environment__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! environments/environment */ "./src/environments/environment.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};













var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
            declarations: [
                _app_component__WEBPACK_IMPORTED_MODULE_2__["AppComponent"],
                core_footer_footer_component__WEBPACK_IMPORTED_MODULE_3__["FooterComponent"],
                core_header_header_component__WEBPACK_IMPORTED_MODULE_4__["HeaderComponent"],
            ],
            imports: [
                _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
                _app_routing_module__WEBPACK_IMPORTED_MODULE_6__["AppRoutingModule"],
                _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_8__["BrowserAnimationsModule"],
                _modules_home_home_module__WEBPACK_IMPORTED_MODULE_7__["HomeModule"],
                _ngrx_store__WEBPACK_IMPORTED_MODULE_9__["StoreModule"].forRoot(_store_reducers__WEBPACK_IMPORTED_MODULE_10__["reducers"], { metaReducers: _store_reducers__WEBPACK_IMPORTED_MODULE_10__["metaReducers"] }),
                !environments_environment__WEBPACK_IMPORTED_MODULE_12__["environment"].production ? _ngrx_store_devtools__WEBPACK_IMPORTED_MODULE_11__["StoreDevtoolsModule"].instrument() : [],
            ],
            providers: [],
            bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_2__["AppComponent"]],
            entryComponents: [
                _modules_home_components_edit_edit_component__WEBPACK_IMPORTED_MODULE_5__["EditComponent"]
            ]
        })
    ], AppModule);
    return AppModule;
}());



/***/ }),

/***/ "./src/app/core/footer/footer.component.html":
/*!***************************************************!*\
  !*** ./src/app/core/footer/footer.component.html ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<footer class=\"bg-white\">\n    <div class=\"row justify-content-between mx-0 px-0\">\n    <div class=\"col-auto\">\n      <!--<select class=\"custom-select\" (change)=\"setLanguage($event.target.value)\">-->\n        <!--<option *ngFor=\"let lang of languages\"-->\n                <!--[value]=\"lang.code\" [selected]=\"lang.code === this.languageService.getLanguage()\">{{ lang.label }}</option>-->\n      <!--</select>-->\n    </div>\n\n    <div class=\"col-auto\">\n      <ul class=\"nav  ml-auto w-100 justify-content-end\">\n        <li class=\"nav-item\">\n          <a class=\"nav-link navbar_item_link\" data-toggle=\"collapse\" data-target=\"#footerNavbar\" routerLink=\"/abouts\">About us</a>\n        </li>\n        <li class=\"nav-item\">\n          <a class=\"nav-link navbar_item_link\" data-toggle=\"collapse\" data-target=\"#footerNavbar\" routerLink=\"/faq\">FAQ</a>\n        </li>\n        <li class=\"nav-item\">\n          <a class=\"nav-link navbar_item_link\" data-toggle=\"collapse\" data-target=\"#footerNavbar\" routerLink=\"/contacts\">Contact</a>\n        </li>\n        <li class=\"nav-item\">\n          <a class=\"nav-link navbar_item_link\" data-toggle=\"collapse\" data-target=\"#footerNavbar\" routerLink=\"/policies\">Policy</a>\n        </li>\n      </ul>\n    </div>\n  </div>\n\n</footer>\n\n\n"

/***/ }),

/***/ "./src/app/core/footer/footer.component.scss":
/*!***************************************************!*\
  !*** ./src/app/core/footer/footer.component.scss ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".avatar {\n  height: 50px;\n  width: 50px; }\n\n.buttonFooter {\n  position: -webkit-sticky;\n  position: sticky;\n  bottom: 20px; }\n\nfooter {\n  border-top: 1px solid #e4e4e4;\n  height: 100px;\n  padding: 20px 0; }\n\nfooter a {\n    text-decoration: none;\n    color: #333; }\n"

/***/ }),

/***/ "./src/app/core/footer/footer.component.ts":
/*!*************************************************!*\
  !*** ./src/app/core/footer/footer.component.ts ***!
  \*************************************************/
/*! exports provided: FooterComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FooterComponent", function() { return FooterComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var FooterComponent = /** @class */ (function () {
    function FooterComponent() {
    }
    FooterComponent.prototype.ngOnInit = function () {
    };
    FooterComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-footer',
            template: __webpack_require__(/*! ./footer.component.html */ "./src/app/core/footer/footer.component.html"),
            styles: [__webpack_require__(/*! ./footer.component.scss */ "./src/app/core/footer/footer.component.scss")]
        }),
        __metadata("design:paramtypes", [])
    ], FooterComponent);
    return FooterComponent;
}());



/***/ }),

/***/ "./src/app/core/header/header.component.html":
/*!***************************************************!*\
  !*** ./src/app/core/header/header.component.html ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<nav class=\"top-navbar navbar navbar-light navbar-expand-md bg-faded justify-content-center\" id=\"top-navbar\">\n    <a class=\"navbar-brand mr-auto navtop-brand d-flex align-items-center\" href=\"#\" id=\"navtop-brand\">\n        <div class=\"smart-power-reader-logo\"></div>\n        <div>Smart Power Reader</div>\n    </a>\n\n</nav>\n<div class=\"top-navbar-padder\"></div>\n\n\n\n\n"

/***/ }),

/***/ "./src/app/core/header/header.component.scss":
/*!***************************************************!*\
  !*** ./src/app/core/header/header.component.scss ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "a.nav-link {\n  color: white; }\n\n.nav-item {\n  padding-left: 5px; }\n\n.top-navbar {\n  height: 81px;\n  background: #ffffff;\n  border-bottom: 1px solid #e4e4e4;\n  box-shadow: none !important; }\n\n.top-navbar .smart-power-reader-logo {\n    content: '';\n    background: url('smart-power-reader.jpg') no-repeat;\n    background-size: auto 50px;\n    background-position: center center;\n    width: 100px;\n    float: left;\n    height: 50px; }\n\n.top-navbar .navbar-brand {\n    color: #333; }\n\n.avatar {\n  width: 50px;\n  height: 50px; }\n\n.navbar-brand img {\n  width: auto;\n  height: 50px !important; }\n"

/***/ }),

/***/ "./src/app/core/header/header.component.ts":
/*!*************************************************!*\
  !*** ./src/app/core/header/header.component.ts ***!
  \*************************************************/
/*! exports provided: HeaderComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HeaderComponent", function() { return HeaderComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var HeaderComponent = /** @class */ (function () {
    function HeaderComponent() {
    }
    HeaderComponent.prototype.ngOnInit = function () {
    };
    HeaderComponent.prototype.logout = function () {
    };
    HeaderComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-header',
            template: __webpack_require__(/*! ./header.component.html */ "./src/app/core/header/header.component.html"),
            styles: [__webpack_require__(/*! ./header.component.scss */ "./src/app/core/header/header.component.scss")]
        }),
        __metadata("design:paramtypes", [])
    ], HeaderComponent);
    return HeaderComponent;
}());



/***/ }),

/***/ "./src/app/modules/home/components/edit/edit.component.html":
/*!******************************************************************!*\
  !*** ./src/app/modules/home/components/edit/edit.component.html ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div [formGroup]=\"form\">\n    <div class=\"header text-center\">Configuration</div>\n    <div class=\"body\">\n\n        <div class=\"row justify-content-between vertical-align\">\n            <div class=\"first-column\">\n                <div class=\"input-group mt-2 align-items-center\">\n                    <div class=\"input-group-prepend\">\n                <span class=\"input-group-text\">\n                  DeviceID\n                </span>\n                    </div>\n                    <div class=\"input-form\">\n                        <select  class=\"form-control\" formControlName=\"deviceId\"\n                                (change)=\"onChangeSensor($event)\">\n                            <option *ngFor=\"let sensor of sensors; let i = index\" [value]=\"sensor.id\">\n                                {{sensor.name ? sensor.name : sensor.id}}\n                            </option>\n                        </select>\n                    </div>\n                </div>\n            </div>\n\n            <div class=\"second-column\">\n                <div class=\"input-group mt-2 align-items-center\">\n                    <div class=\"input-group-prepend\">\n                <span class=\"input-group-text\">\n                  Name\n                </span>\n                    </div>\n                    <input type=\"text\"\n                           class=\"form-control\"\n                           id=\"deviceName\"\n                           formControlName=\"deviceName\"\n                           [value]=\"selectedSensor && selectedSensor.name  ? selectedSensor.name : null\">\n                </div>\n            </div>\n        </div>\n\n        <div class=\"row justify-content-between vertical-align mt-2\">\n\n            <div class=\"first-column\">\n                <div class=\"input-group mt-2 align-items-center\">\n                    <div class=\"input-group-prepend\">\n                <span class=\"input-group-text\">\n                  Period\n                </span>\n                    </div>\n                    <input type=\"number\"\n                           class=\"form-control col-3\"\n                           id=\"period\"\n                           formControlName=\"period\"\n                           [value]=\"selectedSensor && selectedSensor.period ? selectedSensor.period : null\">\n                </div>\n            </div>\n\n        </div>\n    </div>\n\n    <div class=\"footer mt-4\">\n        <div class=\"row justify-content-between\">\n            <button type=\"button\" class=\"cancel-button\" (click)=\"close()\">Cancel</button>\n            <button type=\"button\" class=\"save-button\" [disabled]=\"!isFormValid()\" (click)=\"save()\">Save</button>\n        </div>\n    </div>\n\n</div>\n"

/***/ }),

/***/ "./src/app/modules/home/components/edit/edit.component.scss":
/*!******************************************************************!*\
  !*** ./src/app/modules/home/components/edit/edit.component.scss ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".header {\n  font-size: 30px;\n  font-weight: bold; }\n\n.row {\n  margin-left: 0;\n  margin-right: 0;\n  width: 650px; }\n\n.row .first-column {\n    width: 400px; }\n\n.row .first-column .input-group-prepend {\n      width: 90px !important; }\n\n.row .first-column .input-form {\n      width: 275px; }\n\n.row .second-column .form-control {\n    width: 150px; }\n\n.form-control {\n  border-radius: 0.25rem !important; }\n\n.cancel-button {\n  background-color: #cc1c35;\n  color: white; }\n\n.save-button {\n  background-color: #009688;\n  color: white; }\n\nbutton {\n  width: 100px;\n  height: 35px;\n  border: none;\n  border-radius: 3px;\n  box-shadow: 0 0 0.75rem #e4e4e4; }\n"

/***/ }),

/***/ "./src/app/modules/home/components/edit/edit.component.ts":
/*!****************************************************************!*\
  !*** ./src/app/modules/home/components/edit/edit.component.ts ***!
  \****************************************************************/
/*! exports provided: EditComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EditComponent", function() { return EditComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var _services_sensor_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../services/sensor.service */ "./src/app/modules/home/services/sensor.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var EditComponent = /** @class */ (function () {
    function EditComponent(sensorService) {
        this.sensorService = sensorService;
        this.onClosed = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
        this.onUpdated = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
    }
    EditComponent.prototype.ngOnInit = function () {
        this.form = new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormGroup"]({
            deviceId: new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControl"](''),
            deviceName: new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControl"](),
            period: new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControl"](0, [_angular_forms__WEBPACK_IMPORTED_MODULE_1__["Validators"].min(0)])
        });
    };
    EditComponent.prototype.save = function () {
        var _this = this;
        var formValue = this.form.getRawValue();
        var editedSensor = {
            id: formValue.deviceId,
            period: formValue.period,
            status: this.selectedSensor.status,
            name: !formValue.deviceName || (formValue.deviceName && formValue.deviceName.length === 0)
                ? null
                : formValue.deviceName
        };
        this.sensorService.updateSensors(editedSensor).subscribe(function (res) {
            _this.onUpdated.emit(editedSensor);
        });
    };
    EditComponent.prototype.isFormValid = function () {
        return !this.form.invalid;
    };
    EditComponent.prototype.onChangeSensor = function (event) {
        var id = event.target.value;
        this.selectedSensor = this.sensors.find(function (sensor) { return sensor.id === id; });
        this.form.controls['deviceName'].setValue(this.selectedSensor.name ? this.selectedSensor.name : null);
        this.form.controls['period'].setValue(this.selectedSensor.period ? this.selectedSensor.period : 1);
    };
    EditComponent.prototype.close = function () {
        this.onClosed.emit();
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", Object)
    ], EditComponent.prototype, "onClosed", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", Object)
    ], EditComponent.prototype, "onUpdated", void 0);
    EditComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-components',
            template: __webpack_require__(/*! ./edit.component.html */ "./src/app/modules/home/components/edit/edit.component.html"),
            styles: [__webpack_require__(/*! ./edit.component.scss */ "./src/app/modules/home/components/edit/edit.component.scss")]
        }),
        __metadata("design:paramtypes", [_services_sensor_service__WEBPACK_IMPORTED_MODULE_2__["SensorService"]])
    ], EditComponent);
    return EditComponent;
}());



/***/ }),

/***/ "./src/app/modules/home/components/filter-bar/filter-bar.component.html":
/*!******************************************************************************!*\
  !*** ./src/app/modules/home/components/filter-bar/filter-bar.component.html ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"filter-container\" *ngIf=\"!isLoading\">\n    <div class=\"row mt-4\" [formGroup]=\"form\">\n        <div class=\"col-3\">\n\n            <mat-form-field class=\"col-10\">\n                <mat-select multiple placeholder=\"Select device\" disableOptionCentering=\"true\">\n                    <mat-option (onSelectionChange)=\"change($event)\"\n                                class=\"vertical-align\"\n                                *ngFor=\"let device of sensors; let i = index\"\n                                [value]=\"device\">\n                        <div class=\"row vertical-align\">\n                            <div class=\"col-9 description\">\n                                {{device.name ? device.name : device.id}}\n                            </div>\n                            <div class=\"col-3 text-right vertical-align\">\n                                <mat-icon class=\"fas fa-check\" *ngIf=\"device.status === 'CONNECTED'\"></mat-icon>\n                                <mat-icon class=\"fas fa-ban\" *ngIf=\"device.status === 'DISCONNECTED'\"></mat-icon>\n\n                            </div>\n                        </div>\n                    </mat-option>\n                </mat-select>\n            </mat-form-field>\n\n            <div class=\"row text-right\">\n                <div class=\"col-auto\">\n                    <button type=\"submit\" (click)=\"onSubmit()\" [disabled]=\"!isFormValid\" class=\"submit-button mt-1\">\n                        Show\n                    </button>\n                </div>\n                <div class=\"col-auto\">\n                    <button type=\"button\"\n                            class=\"edit-button mt-1 mr-2\"\n                            (click)=\"editDevice()\">Configuration\n                    </button>\n                </div>\n            </div>\n        </div>\n        <div class=\"col\">\n            <div class=\"row\">\n                <div class=\"col-6\">\n                    <div class=\"row vertical-align\">\n                        <div class=\"col-2 pl-0 header\">From</div>\n                        <div class=\"col-6\">\n                            <div class=\"input-group from align-items-center\">\n                                <input class=\"form-control\" id=\"startDate\"\n                                       (click)=\"activeHover('from')\"\n                                       placeholder=\"yyyy-mm-dd\"\n                                       name=\"startDate\"\n                                       formControlName=\"startDate\"\n                                       ngbDatepicker\n                                       #startDate=\"ngbDatepicker\">\n                                <div class=\"input-group-append\">\n                                    <button class=\"btn btn-outline-secondary\"\n                                            (click)=\"startDate.toggle();activeHover('from')\" type=\"button\">\n                                        <img src=\"../../../../../assets/img/svg/calendar-icon.svg\"\n                                             style=\"width: 1.2rem; height: 1rem; cursor: pointer;\"/>\n                                    </button>\n                                </div>\n                            </div>\n                        </div>\n                        <div class=\"col-3 input-field inline\">\n                            <input align=\"middle\" formControlName=\"startTime\" type=\"time\" onlyPM='true'>\n                        </div>\n                    </div>\n                </div>\n\n                <div class=\"col-6\">\n                    <div class=\"row vertical-align\">\n                        <div class=\"col-2 header\">To</div>\n                        <div class=\"col-6\">\n                            <div class=\"input-group align-items-center\">\n                                <input class=\"form-control\" id=\"endDate\"\n                                       placeholder=\"yyyy-mm-dd\"\n                                       formControlName=\"endDate\"\n                                       ngbDatepicker\n                                       #endDate=\"ngbDatepicker\">\n                                <div class=\"input-group-append\">\n                                    <button class=\"btn btn-outline-secondary\" (click)=\"endDate.toggle()\" type=\"button\">\n                                        <img src=\"../../../../../assets/img/svg/calendar-icon.svg\"\n                                             style=\"width: 1.2rem; height: 1rem; cursor: pointer;\"/>\n                                    </button>\n                                </div>\n                            </div>\n                        </div>\n                        <div class=\"col-3 \">\n                            <input align=\"middle\" formControlName=\"endTime\" type=\"time\" onlyPM=\"true\">\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <div class=\"row mt-4 mr-2 justify-content-between\">\n                <button class=\"filter-button\" type=\"button\" (click)=\"selectDate()\">Today</button>\n                <button class=\"filter-button\" type=\"button\" (click)=\"selectDate(-1)\">Yesterday</button>\n                <button class=\"filter-button\" type=\"button\" (click)=\"selectWeek(-1, -1)\">Last week</button>\n                <button class=\"filter-button\" type=\"button\" (click)=\"selectMonth()\">This month</button>\n                <button class=\"filter-button\" type=\"button\" (click)=\"selectMonth(-1, -1)\">Last month</button>\n                <button class=\"filter-button\" type=\"button\" (click)=\"selectMonth(-3, -1)\">Last 3 months</button>\n                <button class=\"filter-button\" type=\"button\" (click)=\"selectYear()\">This year</button>\n                <button class=\"filter-button\" type=\"button\" (click)=\"selectYear(-1)\">Last Year</button>\n\n            </div>\n        </div>\n\n    </div>\n</div>\n\n\n\n\n\n"

/***/ }),

/***/ "./src/app/modules/home/components/filter-bar/filter-bar.component.scss":
/*!******************************************************************************!*\
  !*** ./src/app/modules/home/components/filter-bar/filter-bar.component.scss ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".header {\n  font-size: 25px; }\n\ninput[type=\"time\"] {\n  display: inline-block;\n  padding: .375rem .75rem;\n  font-size: 1rem;\n  line-height: 1.5;\n  color: #495057;\n  background-color: #fff;\n  background-clip: padding-box;\n  border: 1px solid black;\n  border-radius: .25rem;\n  transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;\n  box-shadow: 0 0 0.75rem #e4e4e4; }\n\n.input-group {\n  border: 1px solid black;\n  border-radius: .25rem;\n  transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;\n  box-shadow: 0 0 0.75rem #e4e4e4; }\n\n.input-group .btn-outline-secondary {\n    border-right: 0;\n    border-bottom: 0;\n    border-top: 0; }\n\n.input-group .form-control {\n    border: none; }\n\n.input-group .form-control:focus {\n    border-right: 1px solid black;\n    box-shadow: none; }\n\n.input-group > .form-control:focus {\n  box-shadow: 0px 0px 1px 3px #448bfc; }\n\n.submit-button, .edit-button {\n  height: 35px;\n  width: 120px;\n  background-color: #009688;\n  color: white;\n  border-radius: 3px; }\n\n.submit-button:disabled {\n  background-color: #929396; }\n\n.filter-button {\n  height: 35px;\n  border: 1px solid black;\n  background-color: #E8E8E8;\n  border-radius: 3px;\n  box-shadow: 0 0 0.75rem #e4e4e4; }\n\ninput[type=\"time\"]:focus {\n  border-color: black;\n  box-shadow: 0px 0px 1px 3px #448bfc; }\n\n.filter-button :hover, .filter-button :focus {\n  box-shadow: 0px 0px 1px 3px #448bfc; }\n\n.description {\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis; }\n\n.mat-select-panel {\n  margin-top: 45px !important; }\n\nmat-icon {\n  height: auto; }\n\n.cdk-overlay-pane {\n  margin-top: 45px !important; }\n"

/***/ }),

/***/ "./src/app/modules/home/components/filter-bar/filter-bar.component.ts":
/*!****************************************************************************!*\
  !*** ./src/app/modules/home/components/filter-bar/filter-bar.component.ts ***!
  \****************************************************************************/
/*! exports provided: FilterBarComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FilterBarComponent", function() { return FilterBarComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _progress_kendo_date_math__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @progress/kendo-date-math */ "./node_modules/@progress/kendo-date-math/dist/es/main.js");
/* harmony import */ var _shared_services_modal_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../shared/services/modal.service */ "./src/app/shared/services/modal.service.ts");
/* harmony import */ var _edit_edit_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../edit/edit.component */ "./src/app/modules/home/components/edit/edit.component.ts");
/* harmony import */ var _ngrx_store__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @ngrx/store */ "./node_modules/@ngrx/store/fesm5/store.js");
/* harmony import */ var store_reducers__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! store/reducers */ "./src/app/store/reducers/index.ts");
/* harmony import */ var store_actions_sensors__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! store/actions/sensors */ "./src/app/store/actions/sensors.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};









var FilterBarComponent = /** @class */ (function () {
    function FilterBarComponent(modalService, store) {
        this.modalService = modalService;
        this.store = store;
        this.sensors = [];
        this.onChangedValue = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
        this.selectedDevices = [];
    }
    FilterBarComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.isLoading = true;
        this.now = Object(_angular_common__WEBPACK_IMPORTED_MODULE_2__["formatDate"])(new Date(), 'yyyy-MM-dd', 'en');
        var todayArr = this.now.split('-');
        var today = {
            year: +todayArr[0],
            month: +todayArr[1],
            day: +todayArr[2]
        };
        this.form = new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormGroup"]({
            startDate: new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControl"](today),
            endDate: new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControl"](today),
            startTime: new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControl"]('00:00'),
            endTime: new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControl"]('23:59')
        });
        var raw = this.form.getRawValue();
        this.startTime = this.combineToDate(raw.startDate, raw.startTime);
        this.endTime = this.combineToDate(raw.endDate, raw.endTime);
        this.isFormValid = this.startTime < this.endTime;
        setTimeout(function () {
            _this.store.pipe(Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_6__["select"])(store_reducers__WEBPACK_IMPORTED_MODULE_7__["getSensors"])).subscribe(function (sensors) {
                _this.sensors = sensors;
                _this.isLoading = false;
            });
        }, 500);
        this.form.valueChanges.subscribe(function (data) {
            var rawValue = _this.form.getRawValue();
            _this.startTime = _this.combineToDate(rawValue.startDate, rawValue.startTime);
            _this.endTime = _this.combineToDate(rawValue.endDate, rawValue.endTime);
            _this.isFormValid = _this.startTime < _this.endTime;
        });
    };
    FilterBarComponent.prototype.onSubmit = function () {
        var rawValue = this.form.getRawValue();
        rawValue['selectedDevices'] = this.selectedDevices;
        this.onChangedValue.emit(rawValue);
    };
    FilterBarComponent.prototype.editDevice = function () {
        var _this = this;
        this.modalService.init(_edit_edit_component__WEBPACK_IMPORTED_MODULE_5__["EditComponent"], { sensors: this.sensors }, {
            onUpdated: function (editedSensor) {
                var index = _this.sensors.findIndex(function (sensor) { return sensor.id === editedSensor.id; });
                _this.sensors[index] = editedSensor;
                _this.store.dispatch(new store_actions_sensors__WEBPACK_IMPORTED_MODULE_8__["UpdateSensorsSAction"](_this.sensors));
                _this.modalService.destroy();
            },
            onClosed: function () {
                _this.modalService.destroy();
            }
        });
    };
    FilterBarComponent.prototype.selectDate = function (offset) {
        if (offset === void 0) { offset = 0; }
        var date = this.convertDateToHashMap(Object(_progress_kendo_date_math__WEBPACK_IMPORTED_MODULE_3__["addDays"])(new Date(), offset));
        this.form.controls['startDate'].setValue(date);
        this.form.controls['endDate'].setValue(date);
    };
    FilterBarComponent.prototype.selectWeek = function (from, to) {
        if (from === void 0) { from = 0; }
        if (to === void 0) { to = 0; }
        var fromWeek = Object(_progress_kendo_date_math__WEBPACK_IMPORTED_MODULE_3__["firstDayInWeek"])(Object(_progress_kendo_date_math__WEBPACK_IMPORTED_MODULE_3__["addDays"])(new Date(), from), _progress_kendo_date_math__WEBPACK_IMPORTED_MODULE_3__["Day"].Monday);
        var toWeek = Object(_progress_kendo_date_math__WEBPACK_IMPORTED_MODULE_3__["addDays"])(Object(_progress_kendo_date_math__WEBPACK_IMPORTED_MODULE_3__["firstDayInWeek"])(Object(_progress_kendo_date_math__WEBPACK_IMPORTED_MODULE_3__["addDays"])(new Date(), to), _progress_kendo_date_math__WEBPACK_IMPORTED_MODULE_3__["Day"].Monday), 6);
        var startDate = this.convertDateToHashMap(fromWeek);
        var endDate = this.convertDateToHashMap(toWeek);
        this.form.controls['startDate'].setValue(startDate);
        this.form.controls['endDate'].setValue(endDate);
    };
    FilterBarComponent.prototype.selectMonth = function (from, to) {
        if (from === void 0) { from = 0; }
        if (to === void 0) { to = 0; }
        var fromMonth = Object(_progress_kendo_date_math__WEBPACK_IMPORTED_MODULE_3__["addMonths"])(new Date(), from);
        var toMonth = Object(_progress_kendo_date_math__WEBPACK_IMPORTED_MODULE_3__["addMonths"])(new Date(), to);
        var startDate = this.convertDateToHashMap(Object(_progress_kendo_date_math__WEBPACK_IMPORTED_MODULE_3__["firstDayOfMonth"])(fromMonth));
        var endDate = this.convertDateToHashMap(Object(_progress_kendo_date_math__WEBPACK_IMPORTED_MODULE_3__["lastDayOfMonth"])(toMonth));
        this.form.controls['startDate'].setValue(startDate);
        this.form.controls['endDate'].setValue(endDate);
    };
    FilterBarComponent.prototype.selectYear = function (num) {
        if (num === void 0) { num = 0; }
        var year = new Date().getFullYear() + num;
        var startYear = this.convertDateToHashMap(new Date(year, 0, 1));
        var endYear = this.convertDateToHashMap(new Date(year, 11, 31));
        this.form.controls['startDate'].setValue(startYear);
        this.form.controls['endDate'].setValue(endYear);
    };
    FilterBarComponent.prototype.convertDateToHashMap = function (date) {
        var dateString = Object(_angular_common__WEBPACK_IMPORTED_MODULE_2__["formatDate"])(date, 'yyyy-MM-dd', 'en');
        var dateArr = dateString.split('-');
        return {
            year: +dateArr[0],
            month: +dateArr[1],
            day: +dateArr[2]
        };
    };
    FilterBarComponent.prototype.combineToDate = function (dateHashMap, time) {
        var date = new Date(dateHashMap.year, dateHashMap.month - 1, dateHashMap.day, +time.substr(0, 2), +time.substr(3, 2));
        return date;
    };
    FilterBarComponent.prototype.activeHover = function (className) {
        console.log(document.getElementsByClassName('input-group ' + className).item(0));
    };
    FilterBarComponent.prototype.change = function (event) {
        var device = event.source.value;
        if (event.isUserInput) {
            if (event.source.selected)
                this.selectedDevices.push([device.id, device.name]);
            else {
                var index = this.selectedDevices.findIndex(function (item) { return device.id === item[0]; });
                this.selectedDevices.splice(index, 1);
            }
        }
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", Object)
    ], FilterBarComponent.prototype, "onChangedValue", void 0);
    FilterBarComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-filter-bar',
            template: __webpack_require__(/*! ./filter-bar.component.html */ "./src/app/modules/home/components/filter-bar/filter-bar.component.html"),
            styles: [__webpack_require__(/*! ./filter-bar.component.scss */ "./src/app/modules/home/components/filter-bar/filter-bar.component.scss")]
        }),
        __metadata("design:paramtypes", [_shared_services_modal_service__WEBPACK_IMPORTED_MODULE_4__["ModalService"],
            _ngrx_store__WEBPACK_IMPORTED_MODULE_6__["Store"]])
    ], FilterBarComponent);
    return FilterBarComponent;
}());



/***/ }),

/***/ "./src/app/modules/home/components/graph-summary/graph-summary.component.html":
/*!************************************************************************************!*\
  !*** ./src/app/modules/home/components/graph-summary/graph-summary.component.html ***!
  \************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div *ngIf=\"!isLoading\" class=\"row mt-4 mx-3 graph-wrapper\">\n    <ngx-charts-line-chart\n            class=\"mt-3\"\n            [results]=\"results\"\n            [xAxis]=\"showXAxis\"\n            [yAxis]=\"showYAxis\"\n            [legend]=\"showLegend\"\n            [showXAxisLabel]=\"showXAxisLabel\"\n            [showYAxisLabel]=\"showYAxisLabel\"\n            [xAxisLabel]=\"xAxisLabel\"\n            [yAxisLabel]=\"yAxisLabel\"\n            [roundDomains]=\"roundDomains\"\n            [autoScale]=\"autoScale\"\n            [xAxisTickFormatting]=\"isLessThan3Days ? axisFormatTime : (isLessThan1Month ? axisFormatDate : axisFormatMonth)\">\n        <!--<ng-template #tooltipTemplate let-model=\"model\">-->\n        <!--<div >{{model.series}}</div>-->\n        <!--<div >{{model.name | date: isLessThan3Days ? 'MMM dd HH:mm' : 'MMM dd yy' }}</div>-->\n        <!--<div >{{model.value}}</div>-->\n        <!--</ng-template>-->\n        <ng-template #tooltipTemplate let-model=\"model\">\n            <div class=\"area-tooltip-container\">\n                <!--<div *ngFor=\"let tooltipItem of model | json \" class=\"tooltip-item\" style=\"text-align: center;\">-->\n                <a style=\" font-size: 1.2em; color: deepskyblue;\">{{model.series}}</a><br/>\n                <!--<a *ngIf=\"isLessThan3Days\" style=\" font-size: 1.2em;\"><br />{{model.name | date: 'HH:mm'}}</a>-->\n                <!--<a *ngIf=\"isLessThan3Days\" style=\" font-size: 1.3em; font-weight: 600;\"><br />&#183;</a><br />-->\n                <!--<a style=\" font-size: 1.2em; font-weight: 600;\">{{model.name | date: 'dd.MM.yyyy'}} &#183; </a>-->\n                <a>{{model.name | date: isLessThan3Days ? 'MMM dd HH:mm' : 'MMM dd yyyy' }}</a><br/>\n                <a style=\" font-size: 1em; font-weight: 600;\">{{model.value | number: '1.5'}}</a>\n                <!--</div>-->\n            </div>\n        </ng-template>\n\n        <!--<ng-template #seriesTooltipTemplate let-model=\"model\">-->\n\n\n        <!--</ng-template>-->\n    </ngx-charts-line-chart>\n\n</div>\n\n"

/***/ }),

/***/ "./src/app/modules/home/components/graph-summary/graph-summary.component.scss":
/*!************************************************************************************!*\
  !*** ./src/app/modules/home/components/graph-summary/graph-summary.component.scss ***!
  \************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".graph-wrapper {\n  overflow: scroll;\n  height: calc(100vh - 81px - 100px - 100px); }\n  .graph-wrapper ngx-charts-legend {\n    margin-left: 20px !important; }\n"

/***/ }),

/***/ "./src/app/modules/home/components/graph-summary/graph-summary.component.ts":
/*!**********************************************************************************!*\
  !*** ./src/app/modules/home/components/graph-summary/graph-summary.component.ts ***!
  \**********************************************************************************/
/*! exports provided: GraphSummaryComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GraphSummaryComponent", function() { return GraphSummaryComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _services_sensor_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../services/sensor.service */ "./src/app/modules/home/services/sensor.service.ts");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _constants_constants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../constants/constants */ "./src/app/modules/home/constants/constants.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var GraphSummaryComponent = /** @class */ (function () {
    function GraphSummaryComponent(sensorService) {
        this.sensorService = sensorService;
        this.results = [];
        this.isLoading = true;
        this.isLoaded = false;
        this.showXAxis = true;
        this.showYAxis = true;
        this.showLegend = true;
        this.showXAxisLabel = true;
        this.showYAxisLabel = true;
        this.yAxisLabel = 'Power Meter';
        this.roundDomains = true;
        this.autoScale = true;
        this.ticks = [];
        this.indexTicks = [];
        this.simpleTicks = [];
        this.isLessThan3Days = false;
        this.isLessThan1Month = false;
        this.colorScheme = {
            domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
        };
    }
    GraphSummaryComponent.prototype.ngOnInit = function () {
    };
    GraphSummaryComponent.prototype.drawGraph = function (selectedDevices, from, to) {
        var _this = this;
        this.isLoading = true;
        this.isLoaded = false;
        this.isLessThan3Days = false;
        this.results = [];
        var _loop_1 = function (i) {
            var params = {
                action: _constants_constants__WEBPACK_IMPORTED_MODULE_3__["GET_MEASUREMENT"],
                id: selectedDevices[i][0],
                from: from,
                to: to,
                count: 100
            };
            setTimeout(function () {
                _this.sensorService.getData(params).subscribe(function (res) {
                    var series = res.map(function (s) { return ({
                        name: s.timestamp,
                        value: s.value
                    }); });
                    series.sort(function (a, b) { return a.name < b.name ? 1 : (a.name > b.name ? 1 : 0); });
                    var newSensor = {
                        id: params.id,
                        name: selectedDevices[i][1] ? selectedDevices[i][1] : params.id,
                        series: series
                    };
                    _this.results.push(newSensor);
                    if (i === selectedDevices.length - 1) {
                        _this.isLoading = false;
                    }
                });
            }, 2000);
        };
        for (var i = 0; i < selectedDevices.length; i++) {
            _loop_1(i);
        }
        this.isLessThan3Days = to - from <= 86340000 * 3;
        this.isLessThan1Month = to - from <= 86340000 * 38;
    };
    GraphSummaryComponent.prototype.ngAfterViewInit = function () {
        setTimeout(function (_) {
            window.dispatchEvent(new Event('resize'));
        }); // BUGFIX:
    };
    GraphSummaryComponent.prototype.axisFormatMonth = function (val) {
        return Object(_angular_common__WEBPACK_IMPORTED_MODULE_2__["formatDate"])(new Date(val), 'MMM  yyyy', 'en');
    };
    GraphSummaryComponent.prototype.axisFormatTime = function (val) {
        return Object(_angular_common__WEBPACK_IMPORTED_MODULE_2__["formatDate"])(new Date(val), 'MMM dd HH:mm', 'en');
    };
    GraphSummaryComponent.prototype.axisFormatDate = function (val) {
        return Object(_angular_common__WEBPACK_IMPORTED_MODULE_2__["formatDate"])(new Date(val), 'dd MMM', 'en');
    };
    GraphSummaryComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-graph-summary',
            template: __webpack_require__(/*! ./graph-summary.component.html */ "./src/app/modules/home/components/graph-summary/graph-summary.component.html"),
            styles: [__webpack_require__(/*! ./graph-summary.component.scss */ "./src/app/modules/home/components/graph-summary/graph-summary.component.scss")]
        }),
        __metadata("design:paramtypes", [_services_sensor_service__WEBPACK_IMPORTED_MODULE_1__["SensorService"]])
    ], GraphSummaryComponent);
    return GraphSummaryComponent;
}());



/***/ }),

/***/ "./src/app/modules/home/constants/constants.ts":
/*!*****************************************************!*\
  !*** ./src/app/modules/home/constants/constants.ts ***!
  \*****************************************************/
/*! exports provided: GET_MEASUREMENT, GET_SENSORS, UPDATE_SENSORS */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GET_MEASUREMENT", function() { return GET_MEASUREMENT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GET_SENSORS", function() { return GET_SENSORS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UPDATE_SENSORS", function() { return UPDATE_SENSORS; });
var GET_MEASUREMENT = 'query-measurement';
var GET_SENSORS = 'query-devices';
var UPDATE_SENSORS = 'put-device';


/***/ }),

/***/ "./src/app/modules/home/home-routing.module.ts":
/*!*****************************************************!*\
  !*** ./src/app/modules/home/home-routing.module.ts ***!
  \*****************************************************/
/*! exports provided: HomeRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HomeRoutingModule", function() { return HomeRoutingModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


var routes = [];
var HomeRoutingModule = /** @class */ (function () {
    function HomeRoutingModule() {
    }
    HomeRoutingModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"])({
            imports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"].forChild(routes)],
            exports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]]
        })
    ], HomeRoutingModule);
    return HomeRoutingModule;
}());



/***/ }),

/***/ "./src/app/modules/home/home.module.ts":
/*!*********************************************!*\
  !*** ./src/app/modules/home/home.module.ts ***!
  \*********************************************/
/*! exports provided: HomeModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HomeModule", function() { return HomeModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _home_routing_module__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./home-routing.module */ "./src/app/modules/home/home-routing.module.ts");
/* harmony import */ var _shared_shared_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../shared/shared.module */ "./src/app/shared/shared.module.ts");
/* harmony import */ var _pages_home_page_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pages/home-page.component */ "./src/app/modules/home/pages/home-page.component.ts");
/* harmony import */ var _components_edit_edit_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/edit/edit.component */ "./src/app/modules/home/components/edit/edit.component.ts");
/* harmony import */ var _components_filter_bar_filter_bar_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/filter-bar/filter-bar.component */ "./src/app/modules/home/components/filter-bar/filter-bar.component.ts");
/* harmony import */ var _components_graph_summary_graph_summary_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/graph-summary/graph-summary.component */ "./src/app/modules/home/components/graph-summary/graph-summary.component.ts");
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ "./node_modules/@ng-bootstrap/ng-bootstrap/fesm5/ng-bootstrap.js");
/* harmony import */ var amazing_time_picker__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! amazing-time-picker */ "./node_modules/amazing-time-picker/amazing-time-picker.es5.js");
/* harmony import */ var _swimlane_ngx_charts__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @swimlane/ngx-charts */ "./node_modules/@swimlane/ngx-charts/release/index.js");
/* harmony import */ var _swimlane_ngx_charts__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(_swimlane_ngx_charts__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var _services_sensor_service__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./services/sensor.service */ "./src/app/modules/home/services/sensor.service.ts");
/* harmony import */ var _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/platform-browser/animations */ "./node_modules/@angular/platform-browser/fesm5/animations.js");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};













var HomeModule = /** @class */ (function () {
    function HomeModule() {
    }
    HomeModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"])({
            imports: [
                _shared_shared_module__WEBPACK_IMPORTED_MODULE_2__["SharedModule"],
                _home_routing_module__WEBPACK_IMPORTED_MODULE_1__["HomeRoutingModule"],
                _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_7__["NgbModule"],
                amazing_time_picker__WEBPACK_IMPORTED_MODULE_8__["AmazingTimePickerModule"],
                _swimlane_ngx_charts__WEBPACK_IMPORTED_MODULE_9__["NgxChartsModule"],
                _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_11__["BrowserAnimationsModule"],
                _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_11__["NoopAnimationsModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_12__["MatFormFieldModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_12__["MatSelectModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_12__["MatDatepickerModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_12__["MatNativeDateModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_12__["MatIconModule"]
            ],
            declarations: [
                _pages_home_page_component__WEBPACK_IMPORTED_MODULE_3__["HomePageComponent"],
                _components_edit_edit_component__WEBPACK_IMPORTED_MODULE_4__["EditComponent"],
                _components_filter_bar_filter_bar_component__WEBPACK_IMPORTED_MODULE_5__["FilterBarComponent"],
                _components_graph_summary_graph_summary_component__WEBPACK_IMPORTED_MODULE_6__["GraphSummaryComponent"]
            ],
            providers: [
                _services_sensor_service__WEBPACK_IMPORTED_MODULE_10__["SensorService"]
            ]
        })
    ], HomeModule);
    return HomeModule;
}());



/***/ }),

/***/ "./src/app/modules/home/pages/home-page.component.html":
/*!*************************************************************!*\
  !*** ./src/app/modules/home/pages/home-page.component.html ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"main-page mx-3\">\n    <app-filter-bar (onChangedValue)=\"onChangedValue($event)\">\n    </app-filter-bar>\n    <app-graph-summary></app-graph-summary>\n</div>\n"

/***/ }),

/***/ "./src/app/modules/home/pages/home-page.component.scss":
/*!*************************************************************!*\
  !*** ./src/app/modules/home/pages/home-page.component.scss ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".main-page {\n  min-height: calc(100vh - 81px - 100px); }\n"

/***/ }),

/***/ "./src/app/modules/home/pages/home-page.component.ts":
/*!***********************************************************!*\
  !*** ./src/app/modules/home/pages/home-page.component.ts ***!
  \***********************************************************/
/*! exports provided: HomePageComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HomePageComponent", function() { return HomePageComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _components_graph_summary_graph_summary_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/graph-summary/graph-summary.component */ "./src/app/modules/home/components/graph-summary/graph-summary.component.ts");
/* harmony import */ var _services_sensor_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../services/sensor.service */ "./src/app/modules/home/services/sensor.service.ts");
/* harmony import */ var _ngrx_store__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ngrx/store */ "./node_modules/@ngrx/store/fesm5/store.js");
/* harmony import */ var store_actions_sensors__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! store/actions/sensors */ "./src/app/store/actions/sensors.ts");
/* harmony import */ var rxjs_compat_add_observable_interval__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs-compat/add/observable/interval */ "./node_modules/rxjs-compat/add/observable/interval.js");
/* harmony import */ var rxjs_compat_add_observable_interval__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(rxjs_compat_add_observable_interval__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var rxjs_compat_add_operator_takeWhile__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs-compat/add/operator/takeWhile */ "./node_modules/rxjs-compat/add/operator/takeWhile.js");
/* harmony import */ var rxjs_compat_add_operator_takeWhile__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(rxjs_compat_add_operator_takeWhile__WEBPACK_IMPORTED_MODULE_6__);
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};







var HomePageComponent = /** @class */ (function () {
    function HomePageComponent(sensorService, store) {
        this.sensorService = sensorService;
        this.store = store;
    }
    HomePageComponent.prototype.ngOnInit = function () {
        var _this = this;
        setTimeout(function () {
            _this.getAllSensors();
        }, 500);
        // Observable
        //     .interval(5000)
        //     .takeWhile(() => true)
        //     .subscribe(() =>
        //         setTimeout(() => {
        //             this.getAllSensors();
        //         }, 500)
        //     );
        // interval(60 * 60 * 1000)
        //     .pipe(
        //         tap(() => {
        //             setTimeout(() => {
        //                 this.getAllSensors();
        //             }, 500);
        // })
        // )
        // .subscribe();
    };
    HomePageComponent.prototype.onChangedValue = function (data) {
        this.from = this.convertToDate(data['startDate'], data['startTime']).valueOf();
        this.to = this.convertToDate(data['endDate'], data['endTime']).valueOf();
        this.graphSummaryComponent.drawGraph(data.selectedDevices, this.from, this.to);
    };
    HomePageComponent.prototype.convertToDate = function (date, time) {
        var year = date.year;
        var month = date.month;
        var day = date.day;
        var timeArr = time.split(':');
        var hour = +timeArr[0];
        var minute = +timeArr[1];
        return new Date(year, month - 1, day, hour, minute);
    };
    HomePageComponent.prototype.getAllSensors = function () {
        var _this = this;
        this.store.dispatch(new store_actions_sensors__WEBPACK_IMPORTED_MODULE_4__["SensorsLoadingAction"]());
        this.sensorService.getAllSenors().subscribe(function (sensorList) {
            _this.store.dispatch(new store_actions_sensors__WEBPACK_IMPORTED_MODULE_4__["SensorsLoadedSuccessAction"](sensorList));
        }, function (error1) {
            _this.store.dispatch(new store_actions_sensors__WEBPACK_IMPORTED_MODULE_4__["SensorsLoadedFailAction"]());
        });
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"])(_components_graph_summary_graph_summary_component__WEBPACK_IMPORTED_MODULE_1__["GraphSummaryComponent"]),
        __metadata("design:type", _components_graph_summary_graph_summary_component__WEBPACK_IMPORTED_MODULE_1__["GraphSummaryComponent"])
    ], HomePageComponent.prototype, "graphSummaryComponent", void 0);
    HomePageComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-homepage',
            template: __webpack_require__(/*! ./home-page.component.html */ "./src/app/modules/home/pages/home-page.component.html"),
            styles: [__webpack_require__(/*! ./home-page.component.scss */ "./src/app/modules/home/pages/home-page.component.scss")]
        }),
        __metadata("design:paramtypes", [_services_sensor_service__WEBPACK_IMPORTED_MODULE_2__["SensorService"],
            _ngrx_store__WEBPACK_IMPORTED_MODULE_3__["Store"]])
    ], HomePageComponent);
    return HomePageComponent;
}());



/***/ }),

/***/ "./src/app/modules/home/services/sensor.service.ts":
/*!*********************************************************!*\
  !*** ./src/app/modules/home/services/sensor.service.ts ***!
  \*********************************************************/
/*! exports provided: SensorService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SensorService", function() { return SensorService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var _constants_constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants/constants */ "./src/app/modules/home/constants/constants.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var SensorService = /** @class */ (function () {
    function SensorService(httpClient) {
        this.httpClient = httpClient;
        var url = window.location.href;
        this.host = url.split(/http:\/\/|:/)[1];
        this.serverUrl = 'http://' + this.host + ':3000';
        this.sensorUrl = this.serverUrl + '/sensors';
    }
    SensorService.prototype.getData = function (params) {
        return this.httpClient.get(this.sensorUrl + "/devices", { params: params });
    };
    SensorService.prototype.getAllSenors = function () {
        var params = {
            action: _constants_constants__WEBPACK_IMPORTED_MODULE_2__["GET_SENSORS"]
        };
        return this.httpClient.get("" + this.sensorUrl, { params: params });
    };
    SensorService.prototype.updateSensors = function (body) {
        var params = {
            action: _constants_constants__WEBPACK_IMPORTED_MODULE_2__["UPDATE_SENSORS"]
        };
        return this.httpClient.put("" + this.sensorUrl, body, { params: params });
    };
    SensorService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])({
            providedIn: 'root'
        }),
        __metadata("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"]])
    ], SensorService);
    return SensorService;
}());



/***/ }),

/***/ "./src/app/shared/components/loading-spinner/loading-spinner.component.html":
/*!**********************************************************************************!*\
  !*** ./src/app/shared/components/loading-spinner/loading-spinner.component.html ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"spinner\">\n  <div class=\"bounce1\"></div>\n  <div class=\"bounce2\"></div>\n  <div class=\"bounce3\"></div>\n</div>\n"

/***/ }),

/***/ "./src/app/shared/components/loading-spinner/loading-spinner.component.scss":
/*!**********************************************************************************!*\
  !*** ./src/app/shared/components/loading-spinner/loading-spinner.component.scss ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".spinner {\n  margin: 0 auto;\n  width: 70px;\n  text-align: center; }\n\n.spinner > div {\n  width: 12px;\n  height: 12px;\n  background-color: #fff;\n  border-radius: 100%;\n  display: inline-block;\n  -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;\n  animation: sk-bouncedelay 1.4s infinite ease-in-out both; }\n\n.spinner .bounce1 {\n  -webkit-animation-delay: -0.32s;\n  animation-delay: -0.32s; }\n\n.spinner .bounce2 {\n  -webkit-animation-delay: -0.16s;\n  animation-delay: -0.16s; }\n\n@-webkit-keyframes sk-bouncedelay {\n  0%, 80%, 100% {\n    -webkit-transform: scale(0); }\n  40% {\n    -webkit-transform: scale(1); } }\n\n@keyframes sk-bouncedelay {\n  0%, 80%, 100% {\n    -webkit-transform: scale(0);\n    transform: scale(0); }\n  40% {\n    -webkit-transform: scale(1);\n    transform: scale(1); } }\n"

/***/ }),

/***/ "./src/app/shared/components/loading-spinner/loading-spinner.component.ts":
/*!********************************************************************************!*\
  !*** ./src/app/shared/components/loading-spinner/loading-spinner.component.ts ***!
  \********************************************************************************/
/*! exports provided: LoadingSpinnerComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LoadingSpinnerComponent", function() { return LoadingSpinnerComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var LoadingSpinnerComponent = /** @class */ (function () {
    function LoadingSpinnerComponent() {
    }
    LoadingSpinnerComponent.prototype.ngOnInit = function () {
    };
    LoadingSpinnerComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-loading-spinner',
            template: __webpack_require__(/*! ./loading-spinner.component.html */ "./src/app/shared/components/loading-spinner/loading-spinner.component.html"),
            styles: [__webpack_require__(/*! ./loading-spinner.component.scss */ "./src/app/shared/components/loading-spinner/loading-spinner.component.scss")]
        }),
        __metadata("design:paramtypes", [])
    ], LoadingSpinnerComponent);
    return LoadingSpinnerComponent;
}());



/***/ }),

/***/ "./src/app/shared/services/dom.service.ts":
/*!************************************************!*\
  !*** ./src/app/shared/services/dom.service.ts ***!
  \************************************************/
/*! exports provided: DomService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DomService", function() { return DomService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var DomService = /** @class */ (function () {
    function DomService(componentFactoryResolver, appRef, injector) {
        this.componentFactoryResolver = componentFactoryResolver;
        this.appRef = appRef;
        this.injector = injector;
        this.workingChild = '';
    }
    DomService.prototype.appendComponentTo = function (parentId, child, childConfig) {
        // Create a component reference from the component
        var childComponent = this.componentFactoryResolver.resolveComponentFactory(child);
        if (childComponent.componentType.name !== this.workingChild) {
            this.addComponent(parentId, child, childConfig);
            this.workingChild = childComponent.componentType.name;
        }
    };
    DomService.prototype.removeComponent = function () {
        this.appRef.detachView(this.childComponentRef.hostView);
        this.childComponentRef.destroy();
        this.workingChild = '';
    };
    DomService.prototype.attachConfig = function (config, componentRef) {
        var inputs = config.inputs;
        var outputs = config.outputs;
        for (var key in inputs) {
            componentRef.instance[key] = inputs[key];
        }
        var _loop_1 = function (key) {
            //   componentRef.instance[key] = outputs[key];
            // subscribe to output event and invoke function
            // console.log(componentRef.instance[key], outputs[key]);
            if (componentRef.instance[key] instanceof _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]) {
                componentRef.instance[key].subscribe(function (r) {
                    outputs[key](r);
                });
            }
        };
        for (var key in outputs) {
            _loop_1(key);
        }
    };
    DomService.prototype.addComponent = function (parentId, childComponent, childConfig) {
        var childComponentRef = this.componentFactoryResolver
            .resolveComponentFactory(childComponent)
            .create(this.injector);
        // Check if a component is attached
        if (this.appRef.viewCount < 2) {
            // Attach the config to the child (inputs and outputs)
            this.attachConfig(childConfig, childComponentRef);
            this.childComponentRef = childComponentRef;
            // Attach component to the appRef so that it's inside the ng component tree
            this.appRef.attachView(childComponentRef.hostView);
            // Get DOM element from component
            var childDomElem = childComponentRef.hostView
                .rootNodes[0];
            // Append DOM element to the body
            document.getElementById(parentId).appendChild(childDomElem);
        }
    };
    DomService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])({ providedIn: 'root' }),
        __metadata("design:paramtypes", [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ComponentFactoryResolver"],
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ApplicationRef"],
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injector"]])
    ], DomService);
    return DomService;
}());



/***/ }),

/***/ "./src/app/shared/services/modal.service.ts":
/*!**************************************************!*\
  !*** ./src/app/shared/services/modal.service.ts ***!
  \**************************************************/
/*! exports provided: ModalService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ModalService", function() { return ModalService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _dom_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./dom.service */ "./src/app/shared/services/dom.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var ModalService = /** @class */ (function () {
    function ModalService(domService) {
        this.domService = domService;
        this.modalElementId = 'modal-container';
        this.overlayElementId = 'modal-background';
        this.wrapperElementId = 'modal-wrapper';
    }
    ModalService.prototype.init = function (component, inputs, outputs) {
        var config = {
            inputs: inputs,
            outputs: outputs
        };
        this.domService.appendComponentTo(this.modalElementId, component, config);
        document.getElementById(this.modalElementId).style.visibility = 'visible';
        document.getElementById(this.overlayElementId).style.visibility = 'visible';
        document.getElementById(this.wrapperElementId).style.display = 'block';
    };
    ModalService.prototype.destroy = function () {
        this.domService.removeComponent();
        document.getElementById(this.modalElementId).style.visibility = 'hidden';
        document.getElementById(this.overlayElementId).style.visibility = 'hidden';
        document.getElementById(this.wrapperElementId).style.display = 'none';
    };
    ModalService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])({ providedIn: 'root' }),
        __metadata("design:paramtypes", [_dom_service__WEBPACK_IMPORTED_MODULE_1__["DomService"]])
    ], ModalService);
    return ModalService;
}());



/***/ }),

/***/ "./src/app/shared/shared.module.ts":
/*!*****************************************!*\
  !*** ./src/app/shared/shared.module.ts ***!
  \*****************************************/
/*! exports provided: SharedModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SharedModule", function() { return SharedModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var _components_loading_spinner_loading_spinner_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/loading-spinner/loading-spinner.component */ "./src/app/shared/components/loading-spinner/loading-spinner.component.ts");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};





var SharedModule = /** @class */ (function () {
    function SharedModule() {
    }
    SharedModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"])({
            imports: [
                _angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormsModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_2__["ReactiveFormsModule"],
                _angular_common_http__WEBPACK_IMPORTED_MODULE_4__["HttpClientModule"]
            ],
            declarations: [
                _components_loading_spinner_loading_spinner_component__WEBPACK_IMPORTED_MODULE_3__["LoadingSpinnerComponent"]
            ],
            exports: [
                _angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormsModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_2__["ReactiveFormsModule"],
                _components_loading_spinner_loading_spinner_component__WEBPACK_IMPORTED_MODULE_3__["LoadingSpinnerComponent"],
                _angular_common_http__WEBPACK_IMPORTED_MODULE_4__["HttpClientModule"]
            ]
        })
    ], SharedModule);
    return SharedModule;
}());



/***/ }),

/***/ "./src/app/store/actions/sensors.ts":
/*!******************************************!*\
  !*** ./src/app/store/actions/sensors.ts ***!
  \******************************************/
/*! exports provided: UPDATE_SENSORS, CLEAR_SENSORS, SENSORS_LOADING, SENSORS_LOAD_SUCCESS, SENSORS_LOAD_FAIL, SELECT_SENSORS, UpdateSensorsSAction, SelectSensorsAction, SensorsLoadingAction, SensorsLoadedSuccessAction, SensorsLoadedFailAction, ClearSensorsAction */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UPDATE_SENSORS", function() { return UPDATE_SENSORS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CLEAR_SENSORS", function() { return CLEAR_SENSORS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SENSORS_LOADING", function() { return SENSORS_LOADING; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SENSORS_LOAD_SUCCESS", function() { return SENSORS_LOAD_SUCCESS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SENSORS_LOAD_FAIL", function() { return SENSORS_LOAD_FAIL; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SELECT_SENSORS", function() { return SELECT_SENSORS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UpdateSensorsSAction", function() { return UpdateSensorsSAction; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SelectSensorsAction", function() { return SelectSensorsAction; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SensorsLoadingAction", function() { return SensorsLoadingAction; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SensorsLoadedSuccessAction", function() { return SensorsLoadedSuccessAction; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SensorsLoadedFailAction", function() { return SensorsLoadedFailAction; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ClearSensorsAction", function() { return ClearSensorsAction; });
var UPDATE_SENSORS = 'main/UPDATE-SENSORS';
var CLEAR_SENSORS = 'main/CLEAR-SENSORS';
var SENSORS_LOADING = 'main/SENSORS_LOADING';
var SENSORS_LOAD_SUCCESS = 'main/SENSORS_LOAD_SUCCESS';
var SENSORS_LOAD_FAIL = 'main/SENSORS_LOAD_FAIL';
var SELECT_SENSORS = 'main/SELECT_SENSORS';
/**
 * Update Sensors Action
 */
var UpdateSensorsSAction = /** @class */ (function () {
    function UpdateSensorsSAction(payload) {
        this.payload = payload;
        this.type = UPDATE_SENSORS;
    }
    return UpdateSensorsSAction;
}());

/**
 * Update Selected Sensors Action
 */
var SelectSensorsAction = /** @class */ (function () {
    function SelectSensorsAction(payload) {
        this.payload = payload;
        this.type = SELECT_SENSORS;
    }
    return SelectSensorsAction;
}());

/**
 * Load Sensors Action
 */
var SensorsLoadingAction = /** @class */ (function () {
    function SensorsLoadingAction() {
        this.type = SENSORS_LOADING;
    }
    return SensorsLoadingAction;
}());

var SensorsLoadedSuccessAction = /** @class */ (function () {
    function SensorsLoadedSuccessAction(payload) {
        this.payload = payload;
        this.type = SENSORS_LOAD_SUCCESS;
    }
    return SensorsLoadedSuccessAction;
}());

var SensorsLoadedFailAction = /** @class */ (function () {
    function SensorsLoadedFailAction() {
        this.type = SENSORS_LOAD_FAIL;
    }
    return SensorsLoadedFailAction;
}());

/**
 * Clear Sensors Actions
 */
var ClearSensorsAction = /** @class */ (function () {
    function ClearSensorsAction() {
        this.type = CLEAR_SENSORS;
    }
    return ClearSensorsAction;
}());



/***/ }),

/***/ "./src/app/store/reducers/index.ts":
/*!*****************************************!*\
  !*** ./src/app/store/reducers/index.ts ***!
  \*****************************************/
/*! exports provided: reducers, logger, productionReducer, reducer, getSensorslState, getSelectedSensors, getSensors, metaReducers */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "reducers", function() { return reducers; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "logger", function() { return logger; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "productionReducer", function() { return productionReducer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "reducer", function() { return reducer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSensorslState", function() { return getSensorslState; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSelectedSensors", function() { return getSelectedSensors; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSensors", function() { return getSensors; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "metaReducers", function() { return metaReducers; });
/* harmony import */ var _ngrx_store__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ngrx/store */ "./node_modules/@ngrx/store/fesm5/store.js");
/* harmony import */ var environments_environment__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! environments/environment */ "./src/environments/environment.ts");
/* harmony import */ var _sensors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./sensors */ "./src/app/store/reducers/sensors.ts");



var reducers = {
    sensors: _sensors__WEBPACK_IMPORTED_MODULE_2__["reducer"],
};
function logger(reduce) {
    return function (state, action) {
        var result = reduce(state, action);
        console.groupCollapsed(action.type);
        console.log('prev state', state);
        console.log('action', action);
        console.log('next state', result);
        console.groupEnd();
        return result;
    };
}
// const developmentReducer: ActionReducer<State> = compose(storeFreeze, combineReducers)(reducers);
var productionReducer = Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["combineReducers"])(reducers);
function reducer(state, action) {
    //   if (environment.production) {
    return productionReducer(state, action);
    //   } else {
    //     return developmentReducer(state, action);
    //   }
}
var getSensorslState = function (state) { return state.sensors; };
var getSelectedSensors = Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["createSelector"])(getSensorslState, _sensors__WEBPACK_IMPORTED_MODULE_2__["getSelectedSensors"]);
var getSensors = Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["createSelector"])(getSensorslState, _sensors__WEBPACK_IMPORTED_MODULE_2__["getSensors"]);
// export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
var metaReducers = !environments_environment__WEBPACK_IMPORTED_MODULE_1__["environment"].production
    ? []
    : [];


/***/ }),

/***/ "./src/app/store/reducers/sensors.ts":
/*!*******************************************!*\
  !*** ./src/app/store/reducers/sensors.ts ***!
  \*******************************************/
/*! exports provided: reducer, getSensors, getSelectedSensors */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "reducer", function() { return reducer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSensors", function() { return getSensors; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSelectedSensors", function() { return getSelectedSensors; });
/* harmony import */ var _actions_sensors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../actions/sensors */ "./src/app/store/actions/sensors.ts");

var initialState = {
    sensors: [],
    selectedSensors: [],
    loading: false,
    loaded: false,
};
function reducer(state, action) {
    if (state === void 0) { state = initialState; }
    switch (action.type) {
        case _actions_sensors__WEBPACK_IMPORTED_MODULE_0__["SENSORS_LOADING"]: {
            return Object.assign({}, state, {
                loading: true,
                loaded: false
            });
        }
        case _actions_sensors__WEBPACK_IMPORTED_MODULE_0__["SENSORS_LOAD_SUCCESS"]: {
            return Object.assign({}, state, {
                loading: false,
                loaded: true,
                sensors: action.payload,
                selectedSensors: []
            });
        }
        case _actions_sensors__WEBPACK_IMPORTED_MODULE_0__["SENSORS_LOAD_FAIL"]: {
            return Object.assign({}, state, {
                loading: false,
                loaded: false,
            });
        }
        case _actions_sensors__WEBPACK_IMPORTED_MODULE_0__["UPDATE_SENSORS"]: {
            return Object.assign({}, state, {
                sensors: JSON.parse(JSON.stringify(action.payload)),
            });
        }
        case _actions_sensors__WEBPACK_IMPORTED_MODULE_0__["SELECT_SENSORS"]: {
            return Object.assign({}, state, {
                selectedSensors: JSON.parse(JSON.stringify(action.payload))
            });
        }
        case _actions_sensors__WEBPACK_IMPORTED_MODULE_0__["CLEAR_SENSORS"]: {
            return Object.assign({}, state, {
                sensors: [],
                selectedSensors: [],
            });
        }
        default: {
            return state;
        }
    }
}
var getSensors = function (state) { return state.sensors; };
var getSelectedSensors = function (state) { return state.selectedSensors; };


/***/ }),

/***/ "./src/environments/environment.ts":
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
var serverUrl = 'http://192.168.1.236:3000';
var environment = {
    production: false,
    serverUrl: serverUrl,
    sensorUrl: serverUrl + '/sensors'
};
/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/platform-browser-dynamic */ "./node_modules/@angular/platform-browser-dynamic/fesm5/platform-browser-dynamic.js");
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/app.module */ "./src/app/app.module.ts");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./environments/environment */ "./src/environments/environment.ts");
/* harmony import */ var hammerjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! hammerjs */ "./node_modules/hammerjs/hammer.js");
/* harmony import */ var hammerjs__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(hammerjs__WEBPACK_IMPORTED_MODULE_4__);





if (_environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].production) {
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["enableProdMode"])();
}
Object(_angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_1__["platformBrowserDynamic"])().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_2__["AppModule"])
    .catch(function (err) { return console.error(err); });


/***/ }),

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /Volumes/Data/dev/SmartPowerReader/Frontend/src/main.ts */"./src/main.ts");


/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main.js.map