/* Enyo fix */


enyo._depends = enyo.depends;
enyo._overrideflag = null;

// dependency API uses enyo loader
enyo.depends = function () {

    var size,
        item,
        list = Array.prototype.slice.call(arguments),
        folders = [],
        scripts = [];

    if (enyo._overrideflag) {
        enyo._depends.apply(enyo, enyo._overrideflag);
        enyo._overrideflag = null;
        return;
    }

    size = list.length;
    while (size--) {
        item = list[size];
        if (item) {
            if (item.indexOf("$") !== -1) {
                list[size] = item.replace("$", "$enyo/");
            } else {
                if (enyo.loader.packageFolder) {
                    list[size] = [enyo.loader.packageFolder, item].join("");
                }
            }
        }
    }

    enyo.runtimeLoading = undefined;
    enyo._overrideflag = arguments;
    
    folders = findFolders(list);
    scripts = findScripts(list);
    
    if (folders.length !== 0) {
        enyo.load(folders); //load folder
    }
    
    if (scripts.length !== 0) {
        loadScript(scripts); //load scripts
    }
    
    function loadScript(depends, callback) {
          var depends = enyo.isArray(depends) ? depends : [depends],
              ok = true,
              index = 0,
              l = depends.length;

          enyo.runtimeLoading = true;
          
          var complete = function () {
            index++;
            if (index === l) {
                console.log('---------all files are loaded-----------');
                enyo.isFunction(callback) && callback(depends);
            } else {
                if ( depends[index].match(/\.js/) ) {
                    enyo.machine.script(depends[index], complete, error);
                } else {
                    enyo.machine.sheet(depends[index]);
                    complete();
                }

            }
          };
          
          var error = function () {
            ok = false;
            complete();
          };

          if(l > 0) {
            if ( depends[0].match(/\.js/) ) {
                enyo.machine.script(depends[0], complete, error);
            } else {
                enyo.machine.sheet(depends[0]);
                complete();
            }
          }
    }

    function findFolders(list) {
    	return list.filter(function(item) {
            return !item.match(/\.js/) && !item.match(/\.css/)
        });
    }

    function findScripts(list) {
    	return list.filter(function(item) {
            return item.match(/\.js/) || item.match(/\.css/)
        });
    }
};

enyo.depends("app/common");