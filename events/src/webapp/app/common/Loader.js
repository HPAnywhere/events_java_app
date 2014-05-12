/**
 * Create view with specific functionality according to entry point name and params. For example, show list of events,
 * add new event, edit existing event.
 * @param entryPointName Entry point name. Example: 'LIST_EVENTS'
 * @param params Parameters object. Example: if entry point is "edit event", params may should contain the event object.
 * @param callback Callback function to call in case your miniapp supports 'hasAutoContext' and when entry point name is
 * 'getContextObjects'.
 * @param scope Scope ('this' object) for the callback. See example below.
 */
function openEntryPoint(entryPointName, params, callback, scope) {
    // Simple mechanism to initialize our app in its window on the first time this function is called per window.
    if (!window.myApp) {
        window.myApp = new EventsContainer();
        window.myApp.renderInto(document.body);
        window.myApp.loadData();
    }

    var sortField = 'title'; // Default value.
    try {
        // Get value from user settings, recipe 5.
        var sortOrderSettingValue = params.settings['events.sortSettings']['events.sortSettings.sortBy'][0];
        if (sortOrderSettingValue) {
            sortField = sortOrderSettingValue.substring(sortOrderSettingValue.lastIndexOf('.') + 1); // Either date or name
        }
    } catch (e) {
    }
    myApp.setSortField(sortField);

    // Decide what to do. In this example decide upon the entry point name only, but other information may be used.
    switch (entryPointName) {

        case 'getContextObjects':
        {
            // get the current context from myApp;
            var ctxObjects = myApp.getCtxObjects();

            if (ctxObjects && ctxObjects.length > 0) {
                // pass back the ctx objects
                callback && enyo.isFunction(callback) && callback.apply(scope || this, [ ctxObjects, HPA.miniappId ]);

                myApp.setCtxObjects([]);
            }
            return;

        }
        case 'EP_LIST':
        {
            myApp.listEvents();
            break;
        }
        case 'defaultAction':
        case 'EP_ADD':
        {
            myApp.addEvent();
            break;
        }
        case 'EP_EDIT':
        case 'OpenEntryPoint':
        default:
        {
            // In the general case, we chose to loop over the context objects list, and on the first time an event
            // object is seen -- open it for editing.

            if (params.contextObjects && params.contextObjects.length > 0) {
                for (var i = 0; i < params.contextObjects.length; i++) {
                    var ctx = params.contextObjects[i];
                    if (ctx.dataType == "EVENT") {
                        myApp.editEvent({}, {data: ctx.metaData && (enyo.isString(ctx.metaData) ? JSON.parse(ctx.metaData) : ctx.metaData)});
                        break;
                    }
                }
            }

            break;

        }


    }

    // Recipe 4. Handle state - upon revisiting the same activity...
    if ( params.state && !!params.state.viewMode )
    {
        if ( params.state.viewMode === 'list' ){
            myApp.listEvents();
        }
        else if ( params.state.viewMode === 'edit' )
        {
            myApp.editEvent(null, state);
        }
    }
    
    // Add Andriod back button support, listening to HPA evnet backbutton
    HPA.Events.on('backbutton', function() {
        console.log('[Events App] Backbutton was tapped'); 
        var navFlag = true;
        var currentPage = myApp.currentPage;
        
        if (currentPage && currentPage == 'EDIT_PAGE') {
            navFlag = false;
            myApp.listEvents();
        }
        
        //if navFlag is false, stay in the miniapp, if navFlag is true, get out of the miniapp and return to My Apps tab.
        return navFlag;
    }); 
}

function onloadListener(){
    /**
     * Signal the EE Framework availability for interoperability.
     *
     * This method should be called by the app developer when ever the app is loaded
     * and ready to "talk" with the HPA framework
     *
     * @method setReady
     * @param {Boolean/Object} readyState
     * @param {Optional} readyState.hasDefaultAction
     * @param {Optional} readyState.moreActions
     * @param {Optional} readyState.hasAutoContext recipe 3
     **/
    HPA.Framework.setReady(true);
    
    return false;
}

!document.body ? window.addEventListener("load", onloadListener, false) : onloadListener();
//HPA.Interop.setReady({ hasDefaultAction: true, hasAutoContext: true});