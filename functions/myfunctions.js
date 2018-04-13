/*jslint nomen: true, node: true, unparam: true, white: true*/
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
    },

    getRidOfEmptyItems: function (arr) {
      var i;
      for (i = 0; i < arr.length; i += 1) {
        if (!arr[i]) {
          arr.splice(i,1);
          i -= 1;
        }
      }
      return arr;
    },

    createComplicatedQuery: function (arr) {
      var i,
        str = '',
        catStr = '',
        getCatPart = function (str) {
          return str.slice(0, str.length-4) + '-' + str.slice(str.length-4);
        },
        checkIfCat = function (str) {
          var regex = /^[A-Za-z0-9]{2,3}[0-9]{4}$/i;
          if (regex.test(str)) {
            return true;
          }
          return false;
        },
        countCatParts = false;

      for (i = 0; i < arr.length; i += 1) {
        //search query with cat style (with'-') or without it
        if (checkIfCat(arr[i])) {
          countCatParts = true;
          if (i === 0) {
            str = "(Description like N'%"+arr[i]+"%' or Numbers like '%"+arr[i]+"%')";
            catStr = "(Description like N'%"+getCatPart(arr[i])+"%' or Numbers like '%"+getCatPart(arr[i])+"%')";
          } else {
            str = str + " AND (Description like N'%"+arr[i]+"%' or Numbers like '%"+arr[i]+"%')";
            catStr = catStr + " AND (Description like N'%"+getCatPart(arr[i])+"%' or Numbers like '%"+getCatPart(arr[i])+"%')";
          }
        } else {
          if (i === 0) {
            str = "(Description like N'%"+arr[i]+"%' or Numbers like '%"+arr[i]+"%')";
            catStr = "(Description like N'%"+arr[i]+"%' or Numbers like '%"+arr[i]+"%')";
          } else {
            str = str + " AND (Description like N'%"+arr[i]+"%' or Numbers like '%"+arr[i]+"%')";
            catStr = catStr + " AND (Description like N'%"+arr[i]+"%' or Numbers like '%"+arr[i]+"%')";
          }
        }
      }
      str = "SELECT inventoryManufacturers.name as manufacturerName, inventoryManufacturers.fullName as manufacturerFullName, inventoryNumbers.number as number, p.ID as id, p.Description AS description, p.Price as price, p.Numbers AS numbers, p.stock as stock, p.ordered as ordered, p.link as link from inventory as p, inventoryNumbers, inventoryManufacturers where (" + str + ")";
      if (countCatParts) {
        str = str + " or (" + catStr + ")";
      }
      str = str + "and inventoryManufacturers.id = inventoryNumbers.manufacturerId and inventoryNumbers.inventoryId = p.id and description not like N'я%' order by p.Description, inventoryNumbers.main desc";
      return str;
    }

  };
}());
