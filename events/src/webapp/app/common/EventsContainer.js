enyo.kind({
    name: 'EventsContainer',
    kind: 'Panels',

    arrangerKind: 'CardArranger',

    accelerated: false,
    animate: false,
    fit: true,
    draggable: false,

    components: [
        { name: "restService", kind: "utils.RestService" },
        { name: "eventsList", kind: 'EventsList' },
        { name: "eventsDetails", kind: 'EventsDetails' }
    ],
    currentPage: 'LIST_PAGE',//default page is list page
    published: {
        data: [],
        ctxObjects: [],
        sortField: 'title'
    },

    handlers: {
        onNewEvent: "addEvent",
        onBack: "listEvents",
        onEditEvent: "editEvent",
        onSaveEvent: "saveEvent",
        onShareEvent: "shareEvent",
        onDeleteEvent: "deleteEvent",
        onReleased: "loadData"
    },

    loadData: function(inSender, inEvent) {
        var me = this;
        this.$.restService.getMethod(
            'services/events/',
            function(sender, response, request) {
                //console.log('getAll success', response);
            	if (!response)  {
            		HPA.Message.error(HPA.I18n.localize('validation.err.noDataSource'));
            	} else {
            		me.setData(response);
            	}
               
                enyo.isFunction(inEvent && inEvent.completePull) && inEvent.completePull();
            },
            function(sender, response, request) {
                // Inform the user an error has occurred, using a modal dialog which will block user
                // interaction in HPA globally, not only in this miniapp's frame.
                HPA.Message.error(HPA.I18n.localize('events.failedLoad'), arguments);
                enyo.isFunction(inEvent && inEvent.completePull) && inEvent.completePull();
            }
        );
    },

    sortFieldChanged: function() {
        this.dataChanged();
    },

    dataChanged: function () {
        var sortField = this.sortField;
        this.data && this.data.sort(function(event1, event2) {
            // Compare the two events by either title or date. We represent dates as an ISO-8601 strings
            // (example: "2013-02-27"), so lexicographic comparison works for either field.
            return event1[sortField].localeCompare(event2[sortField]);
        });
        this.$.eventsList.setData(this.data || []);
        this.render();
    },

    listEvents: function() {
        var idx = this.children.indexOf(this.$.eventsList);
        this.setIndex(idx);
        // Recipe 4.
        HPA.Interop.saveState({ viewMode: 'list' });
        this.currentPage = 'LIST_PAGE';
    },

    editEvent: function(inSender, inEvent) {
    	// enters here from ADD and from EDIT, ADD brings inEvent = null; EDIT - data    	
        var data = inEvent.data || {};
        this.$.eventsDetails.setData(data);
        var idx = this.children.indexOf(this.$.eventsDetails);
        this.setIndex(idx);
        // Recipe 4.
        HPA.Interop.saveState({ viewMode: 'edit', data: data });
        this.currentPage = 'EDIT_PAGE';
    },

    openEvent: function(data) {
        this.editEvent({}, {data: data});
    },

    addEvent: function() {
        this.editEvent({}, {data: null});
    },

    onFailure: function() {
    },

    shareEvent: function(inSender, inEvent) {
        var newData = inEvent.data;
        if (!!newData.id) {
            // Recipe 7.
            // create new ctx object via HPA.Interop.createContextObject factory method
            var ctx = HPA.Interop.createContextObject(newData.id, "EVENT", newData.title, JSON.stringify(newData));
            // share the newly created ctx object
            ctx && HPA.Interop.addContextObjectToExperience(ctx);
        }
    },

    deleteEvent: function(inSender, inEvent) {
        var newData = inEvent.data;
        if (!!newData.id) {
            // Put
            this.$.restService.deleteMethod(
                'services/events/' + newData.id, // TODO: OK?
                enyo.bind(this, this.loadData, {}, {}),
                function() {
//                    console.log('put failure', arguments);
                }
            );
        }
        this.listEvents();
    },

    saveEvent: function(inSender, inEvent) {
        var newData = inEvent.data;
        if (!!newData.id) {
            // Put = updating
        	enyo.forEach(this.getData(), function(it) {
                if (it.id === newData.id) {
                    for (var f in newData) it[f] = newData[f];
                }
            });
            this.$.restService.updateMethod(
                'services/events/' + newData.id, // TODO: OK?
                newData,
                enyo.bind(this, this.loadData, {}, {}),
                function() {
//                    console.log('put failure', arguments);
                }
            );
        } else {
            // Post = adding
            this.getData().push(newData);
            var lastIdx = this.getData().length-1;
            this.$.restService.postMethod(
                'services/events/', // TODO
                newData,
                enyo.bind(this, function(rest, savedData) {
                 	if (!savedData) return;
                    this.data[lastIdx].id = savedData.id;
                    this.$.eventsList.dataChanged();
                    var ctx = HPA.Interop.createContextObject(savedData.id, "EVENT", savedData.title, JSON.stringify(savedData) );
                    ctx && this.ctxObjects.push(ctx);
                }),
                function() {
//                    console.log('post failure', arguments);
                }
            );
        }
        
        //	this stuff is not being proceeded properly since the above bindings are async!!!
        this.$.eventsList.dataChanged();
        this.listEvents();
    }
});