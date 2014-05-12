enyo.kind({

    name: 'EventsList',
    kind: "FittableRows",
    classes: "enyo-unselectable enyo-fit events-listview",
    style: 'background-color: white;',

    published: {
        data: []
    },
    events: {
        onNewEvent: "",
        onEditEvent: "",
        onReleased: ""
    },

    components: [
        { content: HPA.I18n.localize('events.listTitle'), classes: "header" },
        { tag: "span", classes: "header-border" },
        {name: "list", kind: "PulldownList", classes: "events-list", fit: true,
            onSetupItem: "setupItem", onPullRelease: "pullRelease", onPullComplete: "pullComplete", components: [
            { classes: "event", ontap: 'itemTap', components: [

                {name: 'id', tag: "span", classes:'hidden' },
                {name: "importanceIcon", tag: "span", classes: "priority"},
                {name: "title", tag: "span", classes: "title"},

                {name: "owner", tag: "span", classes: "owner", allowHtml: true},
                {name: "date", tag: "span", classes: "date"},
                { name: 'border', tag: 'span', classes: 'border' }
            ]}

        ]}
    ],

    dataChanged: function () {
    	if (this.$.list.setCount) {
    		this.$.list.setCount(this.data.length);
    	}
    },

    setupItem: function (inSender, inEvent) {
        // given some available data.
        var data = this.data[inEvent.index];
        // setup the controls for this item.

        this.$.id.setContent(data.id);
        this.$.date.setContent(new Date(data.date).toLocaleDateString());
        this.$.title.setContent(data.title);
        this.$.importanceIcon.addRemoveClass('HIGH', data.importance == 'HIGH');
        this.$.importanceIcon.addRemoveClass('NORMAL', data.importance == 'NORMAL');
        this.$.owner.setContent(data.owner);
    },

    itemTap: function (inSender, inEvent) {
        this.doEditEvent({ data: this.data[inEvent.index] });

        return true;
    },

    onNewEventTap: function () {
        this.doNewEvent({});

        return true;
    },

    pullRelease: function () {
        this.pulled = true;

        this.doReleased({completePull: enyo.bind(this, function () {
            this.$.list.completePull();
        }) });
    },

    pullComplete: function () {
        this.pulled = false;
        this.$.list.reset();
    }
});
