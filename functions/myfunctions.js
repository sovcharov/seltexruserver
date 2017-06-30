/*jslint nomen: true, node: true*/
(function () {
    "use strict";
    module.exports = {
        getTimeString: function (date) {
            var hour = date.getUTCHours(),
                minute = date.getUTCMinutes();
            if (hour < 10) {
                hour = '0' + hour;
            }
            if (minute < 10) {
                minute = '0' + minute;
            }
            return hour + ':' + minute;
        },

        getDateString: function (date) {
            var day = date.getDate(),
                month = date.getMonth() + 1;
            if (day < 10) {
                day = '0' + day;
            }
            if (month < 10) {
                month = '0' + month;
            }
            return date.getFullYear() + '-' + month + '-' + day;
        }
    };
}());
