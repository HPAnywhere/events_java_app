/**
 *    @class HPA
 *    Enterprise Experience API for MiniApps
 *     Server     {@link HPA.Server}
 *     I18n     {@link HPA.I18n}
 *     Interop {@link HPA.Interop}
 *     Profile     {@link HPA.Profile}
 *     Help         {@link HPA.Help}
 *     Device         {@link HPA.Device}
 *     @singleton
 */
window.HPA = window.HPA || {};
HPA.miniappId = "Mock";
HPA.parentId = "HPA";

function __cleanUp() {
    window.HPA = {};
}

/**
 * @property {Boolean} isTouch indicating we are running in a Touch enabled runtime environment
 */
HPA.isTouch = true;

/**
 *    Server API
 *    @singleton
 */
HPA.Server = function(parentServer) {

    function getMiniappRecord(maId) {
        return null;
    }

    return {

        clean: null,
        /**
         * base path of Enterprise Experience URL
         * @return {String} always "app"
         */
        getAppFolder: function() {
            return "app";
        },

        /**
         * returns the miniapp name
         * @return {String} miniapp name
         */
        getMiniappName: function () {
            return "My App";
        },
        /**
         * service which is provided by given MiniApp to submit a valid rest uri to the request
         * @param {String} resource  action relative path
         * @param {String} miniAppId id of the provider MiniApp
         * @return {String} a valid rest uri
         */
        resourceUrl: function(res, miniappId) {
            return res;
        },

        /**
         * Sends an HTTP request to a HPA server
         * see also Sencha documentation<a href="http://docs.sencha.com/ext-js/4-1/#!/api/Ext.data.Connection-method-request" > request</a>
         * @param opts {Object} filled with relevant data in order to submit an http request
         *
         *
         special properties for requestObject:
         --------------------------------------
         uri:string = the relative uri of the requested resource
         miniAppId:string [optional] = unique miniApp ID. in case current mini-app attempts to access another
         *
         Important:
         ----------
         Ajax server requests are asynchronous,
         and this call will return before the response has been received.
         Process any returned data in a callback function. Based on Sencha’s Ajax API
         */
        request: function(opts) {

        }
    };

}(window.parent.HPA.Server);

/**
 *    Localization API
 *
 *           var msg = HPA.I18n.localize("myApp.greeting", username);
 *           Ext.Msg.show(msg);
 *
 *    @singleton
 */
HPA.I18n = function(miniappId) {
    var map = {"NOTES.description":"Notes Demo MiniApp","noteslistview.title":"Notes","NOTES.help.LIST_NOTES":"Notes Sample MiniApp","NOTES.product.name":"Notes","noteeditorview.title":"Edit Note","data.filter.name.key":"Test Settings","noteslistview.no-items":"No Notes found.","noteeditorview.label.narrative":"Narrative","NOTES.service.name":"Notes","noteeditorview.save":"Save","ADD_NOTE":"Add Note","datasource.context.name":"DemoTouch DataSource","filter_settings.context.name":"Filter Settings","username.name.key":"User Name","password.name.key":"Password","noteslistview.loading":"Loading...","noteeditorview.label.author":"Author","LIST_NOTES":"Show Notes","noteeditorview.back":"Home","datasource.instance.name.key":"DemoTouch DS","noteslistview.new":"New","noteeditorview.label.title":"Title","EDIT_NOTE":"Edit Note"};
    return {
        /**
         * Localize text
         * @param {String} key  localization key
         * @return {String} localized string to be presented to the user
         *           @example
         *           var msg = HPA.I18n.localize("myApp.greeting", username);
         *           Ext.Msg.show(msg);
         *
         */
        localize: function(key) {
            return map[key] || (key+"L");
        }
    };
}(HPA.miniappId);

/**
 *    Interoperability API
 *
 *        In order to achieve full interop functionality some Methods need
 *        to be implemented by the Mini-App (on the main controller object)

 # Open the mini-app entry point in given context objects
 function openEntryPoint(entryPointID ,params ,cb ,scope);

 # param entryPointID  :{string}
 entry point unique ID
 # param params  : {Object}
 a composite object which contains the followings :
 state : an object that stores the users current state
 contextObjects : an array of ContextObjects

 # param cb : {Function}
 a callback function with 2 arguments: [isSuccessful ,options]
 isSuccessful :  set to true in case the Miniapp is able to render its UI per given entryPoint + params , and false otherwise
 options: reserved

 # param scope : {Object}
 the scope to run the entry point

 implementation example:
 ----------------

 function openEntryPoint(entryPoint, contextObjects, cb, scope) {
 console.log('Open EntryPoint : ' + entryPoint);

 var res = myApp.fireEvent('EntryPointCalled', entryPoint, contextObjects);
 Ext.isFunction(cb) && cb.apply(this, [!!res, 'Date : ' + new Date().toTimeString() + ' , From : ' + HPA.miniappId + ' , EntryPoint: ' + entryPoint]);

 }


 usage example:
 ----------------

 var obj =  {
 state: { leftPanelExpanded: true, selectedRowIdx:3 },
 contextObjects: [{objectId: "QCCR1123", dataType: "ALM Change Request", displayName: "button doesn't work..."}, ...]
 }

 HPA.Interop.openEntryPoint("DefectManager", "open", [ obj ]);

 # For further example look at the eem's attached
 @singleton
 */

HPA.Interop = function(miniAppId, parentId) {
    return {
        /**
         * signal the HPA Framework availability for interoperability
         *  @param {Boolean/Object} readyConfig
         */
        setReady: function(readyState) {
        },

        /**
         * signal the HPA Framework to replace the native actions bar
         *  @param {Boolean} hideActions
         */
        setActions: function (hideActions) {
        },

        /*
         Open the mini-app entry point in given context objects
         @param entryPointID {string} entry point unique ID
         @param params {Object} a composite object which contains the followings :
         state : an object that stores the users current state
         contextObjects : an array of ContextObjects

         @param cb a callback function with 2 arguments: [isSuccessful ,options]
         isSuccessful :  set to true in case the Miniapp is able to render its UI per given entryPoint + params , and false otherwise
         options: reserved
         @param scope : the scope to run the entry point
         */
        openEntryPoint: function(targetMiniAppId, entryPoint, contextObjects, cb, scope) {
        },

        /*
         * open an internal navigation point
         * @param displayName {string} to be presented in the drop down nav menu
         * @param cb callback function which will be called when navigation point is chosen
         * @param scope {Object} in which cb will be called
         * @param params {Optional} will be given as arguments when the callback is called
         * */
        openInnerPoint: function (displayName, cb, scope, params) {
            return;// manager.notify(miniAppId, "innerPoint", {name: displayName, callback: cb, scope: scope, params: params}, interoperable);
        },

        /**
         *  ask the HPA Framework whether the given miniApp is available for interop services
         *  @param {String} targetMiniAppId
         *  @return {Boolean}
         */
        isMiniAppAvailable: function(targetMiniAppId) {
            return false;
        },



        /**
         * ask HPA Framework to attach the given context objects to an Experience
         *  @param {Object/Array} ctx an Enterprise Experience Context Object
         */
        addContextObjectToExperience: function(ctx) {

        },

        /**
         *  saves an object with the current state of the app(anything the Miniapp cares to save)
         *  the state is saved based on the current experience that is opened
         * @param state {object} is an object to save - managed by the miniapp itself
         */
        saveState: function(state) {

        },

        /**
         * creates a valid context object based on the arguments given
         * @param {String} objectId  id of the context object
         * @param {String} dataType  is the type of data in the context object
         * @param {String} displayName  is the name of the context object - will display the name as the title of the Experience
         * @param {String} [metaData]  an arbitrary string for extra data needed for later use
         * @return {Object}
         * @return {String} return.objectId  globally unique identifier
         * @return {String} return.dataType  data type
         * @return {String} return.displayName  the display name
         * @return {String} return.metaData
         */
        createContextObject: function(objectId, dataType, displayName, metaData) {
            var ctx = { objectId: objectId,
                dataType: dataType,
                displayName: displayName,
                metaData: metaData || null };

            return  this.isValidContextObject(ctx) ? ctx : null;

        },

        /**
         * validates that the context object is in the correct form
         * @param ctx {Object} is the context object to be tested if valid
         * @return {boolean}
         */
        isValidContextObject: function(ctx) {
            return true;
        },
        /**
         * validates that the context object is valid , returns an array of string represents all the validation errors
         * @param ctx is the context object to be tested if valid
         * @return {String[]}
         */
        validateContextObject: function(ctx) {
            return [];//manager.validateContextObject(ctx);
        }

    };
}(HPA.miniappId, HPA.parentId);

HPA.Message = function (miniAppId, parentId) {
    function clean() {
    }


//    var interoperable = {interopId: miniAppId, id: parentId };

    return {
        clean: clean,

        /**
         * error
         * @param message
         * @param cb callback function
         * @param scope {Object}
         */
        error: function (message, cb, scope) {
             alert(message);
        },
        /**
         * warning
         * @param message
         * @param cb callback function
         * @param scope {Object}
         */
        warning: function (message, cb, scope) {
            alert(message);
        },

        /**
         * info
         * @param message
         * @param cb callback function
         * @param scope {Object}
         */
        info: function (message, cb, scope) {
            alert(message);
        },

        /**
         * confirm
         * @param message
         * @param cb callback function
         * @param scope {Object}
         */
        confirm: function (message, cb, scope) {
            confirm(message);
        }

    }

}(HPA.miniappId, HPA.parentId);

/**
 * @class HPA.Help
 * use Help API
 * @singleton
 */
HPA.Help = function(miniAppId) {

    return {
        SplashScreen:{
            /**
             * shows a splash screen
             *
             *     important:
             *
             *     Desktop Version Only
             *
             * @param  {String} titleKey is the title of the spalsh screen
             * @param  {String} textKey is text to be displayed on the splash screen
             * @param  {String} imagefile the image to be displayed on the miniapp splash screen
             * @param  {String} [splashScreenId] is the id of the splash screen
             */
            showSplashScreen: function(titleKey, textKey, imagefile, splashScreenId) {
            }
        }
    }
}(HPA.miniappId);

/**
 * Device API
 * Access device capabilities (camera, geo-location, contacts etc)
 * @singleton
 */
HPA.Device = function (core) {

    return {
        /**
         * On actual device, access device capabilities via Phonegap
         * as described in the <a href="http://docs.phonegap.com/en/1.9.0/cordova_device_device.md.html">phonegap docs</a>
         *
         *      important
         *     ===========
         *
         *        this will bypass navigator.plugins
         *
         */
        device:{},
        /**
         *
         *    as sepcified in phoneGap docs <a href="http://docs.phonegap.com/en/1.9.0/cordova_device_device.md.html#Device">here</a>
         *
         */
        deviceInfo:{}
    };

}();


/**
 *    Profile API
 *     access Logged-in user properties
 * @singleton
 */
HPA.Profile = function() {
    var profileData = { id: "", displayName: "???"};

    return {
        /**
         * this method retrieves current user info
         * @return {Object}
         * @return {String} return.id is the id of the user
         * @return {String} return.origin the origin
         * @return {String} return.displayName the display name
         * @return {String} return.jobTitle the job title
         * @return {String} return.emails the email
         */
        getInfo: function () {
            return profileData;
        }
    }

}();

