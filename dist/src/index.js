"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var fs = __importStar(require("fs"));
var TrackingMoreApi = /** @class */ (function () {
    function TrackingMoreApi(apiKey) {
        var _this = this;
        this.apiKey = apiKey;
        this.replaceUrl = function (url, data) {
            return data
                ? Object.entries(data).reduce(function (result, _a) {
                    var key = _a[0], value = _a[1];
                    return result.replace(RegExp("{" + key + "}", 'g'), value);
                }, url)
                : url;
        };
        this.request = function (url, method, data) {
            if (method === void 0) { method = 'GET'; }
            return rxjs_1.from(_this.axiosInstance.request({ method: method, url: url, data: data }));
        };
        this.requestFactory = function (url, method) {
            if (method === void 0) { method = 'GET'; }
            return function (data) { return _this.request(url, method, data); };
        };
        this.requestUrlFactory = function (url, method) {
            if (method === void 0) { method = 'GET'; }
            return function (select, data) {
                return _this.request(_this.replaceUrl(url, select), method, data);
            };
        };
        this.carriers = this.requestFactory('/carriers', 'GET');
        this.createTracking = this.requestFactory('/trackings/post', 'POST');
        this.updateTracking = this.requestUrlFactory('/trackings/{carrier_code}/{tracking_number}', 'PUT');
        this.deleteTracking = this.requestUrlFactory('/trackings/{carrier_code}/{tracking_number}', 'DELETE');
        this.getTracking = this.requestUrlFactory('/trackings/{carrier_code}/{tracking_number}', 'GET');
        this.batch = this.requestFactory('/trackings/batch', 'POST');
        this.realtime = this.requestFactory('/trackings/realtime', 'POST');
        this.update = this.requestFactory('/trackings/update', 'POST');
        this.initCarriers = function () {
            return _this.carriers()
                .pipe(operators_1.pluck('data', 'data'), operators_1.map(function (items) {
                return items.reduce(function (prev, acc) {
                    prev[acc.code] = acc;
                    return prev;
                }, {});
            }), operators_1.tap(function (cmap) {
                fs.writeFileSync(__dirname + '/map.json', JSON.stringify(cmap));
            }))
                .subscribe();
        };
        this.axiosInstance = axios_1.default.create({
            baseURL: 'https://api.trackingmore.com/v2',
            headers: {
                'Trackingmore-Api-Key': apiKey,
                'Content-Type': 'application/json',
            },
        });
        this.initCarriers();
    }
    return TrackingMoreApi;
}());
exports.TrackingMoreApi = TrackingMoreApi;
