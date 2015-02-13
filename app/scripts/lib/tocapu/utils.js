define([], function() {

  var template = function(str) {
    var strFunc = 'var p=[];' + 'p.push("' +

    str.replace(/[\r\t\n]/g, ' ')
       .replace(/"(?=[^#]*#>)/g, '\t')
       .split('"').join('\\"')
       .split('\t').join('"')
       .replace(/<#=(.+?)#>/g, '",$1,"')
       .split('<#').join('");')
       .split('#>').join('p.push("')
       + '");return p.join("");';

    return new Function("data", strFunc);
  };

  var utils = function() {

    String.prototype.format = function() {
      var args = [].slice.call(arguments),
        result = this.slice(),
        regexp;
      for (var i = args.length; i--;) {
        regexp = new RegExp('%' + (i + 1), 'g')
        result = result.replace(regexp, args[i]);
      }
      return result;
    };

    return {

      template: template

    };

  };

  return utils();

});
