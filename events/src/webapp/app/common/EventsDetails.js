enyo.kind({
    name: 'EventsDetails',
    kind: 'FittableRows',
    fit: true,
    classes: "events-detailsview",

    published: {
        data: {} // this.emptyData
    },

    events: {
        "onBack": "",
        "onShareEvent": "",
        "onSaveEvent": "",
        "onDeleteEvent": ""
    },

    components: [
        {kind: "FittableColumns", classes: 'header', components: [
            { tag: "span", name: 'back', classes: "button-back", ontap: 'backToList' },
            { tag: 'span', name: 'header', content: 'Edit Event', fit: true, classes: 'title'}
             /*{ tag: "span", name: 'share', classes: "button light share", content: HPA.I18n.localize('events.button.shareEvent'), ontap: 'share' }*/
        ]},
        { tag: "span", classes: "header-border" },

        { name: 'id', kind: 'enyo.Input', type: 'hidden' },

        { tag: 'div', classes: "fields-group", components: [
            {classes: 'page-field', components: [
                { tag: 'label', content: HPA.I18n.localize('events.field.name') },
                { name: 'title', classes: 'shadow-seperator', kind: 'enyo.Input', placeholder: HPA.I18n.localize('events.field.namePlaceHolder') }
            ]},
            {classes: 'page-field owner-field', components: [
                { tag: 'label', content: HPA.I18n.localize('events.field.owner') },
                { name: 'owner', classes: 'shadow-seperator', kind: 'enyo.Input', disabled: true }
            ]},
            {classes: 'page-field', components: [
                { content: HPA.I18n.localize('events.field.when'), tag: "label" },
                {  tag: "span",
                    components: [
                        { tag: 'img', src: 'images/common/callendare.png', classes: "calenderImage"},
                        { classes: 'expenseDate', name: "datePicker", kind: "Input", type: "date", placeholder: 'YYYY-MM-DD'}
                    ]
                }
            ]
            },
            {classes: 'page-field importance-field', components: [
                { tag: 'label', content: HPA.I18n.localize('events.field.importance') },
                { name: 'importance', classes: 'importance', tag: 'span', ontap: "priorityTapped", components: [
                    { tag: 'span', classes: 'radio-button light', content: 'I', priority: "HIGH" },
                    { tag: 'span', classes: 'radio-button light', content: 'O', priority: "NORMAL", attributes: {'active': "true"} }
                ]}
            ]}
        ]},
        {kind: "FittableColumns", classes: 'button-container', components: [
            { tag: 'span', fit: true},
            { tag: "span", name: 'delete', classes: "button light delete", ontap: 'delete', showing: false },
            { tag: "span", name: 'save', classes: "button save", content: HPA.I18n.localize('events.button.saveEvent'), ontap: 'save' }
        ]}
    ],

    getToday: function () {
        var d = new Date();
        function pad(n) {
            return n < 10 ? "0" + n : n + "";
        }
        return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    },

    priorityTapped: function (inSender, inEvent) {
        var priority = inEvent.originator.priority;
        this.$.importance.children[0].setAttribute('active', priority === "HIGH");
        this.$.importance.children[1].setAttribute('active', priority === "NORMAL");
    },

    backToList: function () {
        this.doBack();
        return true;
    },

    delete: function () {
        var values = this.getValues();
        if (!!values.id) {
            this.doDeleteEvent({ data: values });
        }
        return true;
    },

    share: function () {
        var values = this.getValues();
        if (this.validate(values)) {
            this.doShareEvent({ data: values });
        }
        return true;
    },

    save: function () {
        var values = this.getValues();
        if (this.validate(values)) {
            this.doSaveEvent({ data: values });
        }
        return true;
    },

    dataChanged: function () {
        //
        //  Fixing Enyo issue and
        //  cleaning the controls before setting the Values...
        //
        this.$.id.setValue("");
        this.data.id && this.$.id.setValue(this.data.id);
        this.$.header.setContent(HPA.I18n.localize(this.data.id ? "EP_EDIT" : "EP_ADD"));

        if (this.data.date) {
            this.$.datePicker.setValue(this.data.date);
        } else {
            this.$.datePicker.setValue(this.getToday());
        }

        // this.$.datePicker.hasNode().value = this.data.date || this.getToday();
        // this.data.date && this.$.datePicker.setValue(this.data.date);
        
        this.$.title.setValue("");
        this.data.title && this.$.title.setValue(this.data.title);

        // are working fine cause there is no verification of current value...
        this.$.importance.children[0].setAttribute('active', this.data.importance === "HIGH");
        this.$.importance.children[1].setAttribute('active', !this.data.importance || this.data.importance === "NORMAL");

        // In case there is an owner, show him/her. Otherwise, this is a new event and we are setting the owner to be
        // the current user (recipe 2).
        this.$.owner.setValue(HPA.Profile.getInfo().displayName);
        this.data.owner && this.$.owner.setValue(this.data.owner);
        
        this.$.save.setContent(this.data.id ? HPA.I18n.localize('events.button.updateEvent') : HPA.I18n.localize('events.button.saveEvent'));
        this.$.delete.setShowing(!!this.data.id);
        this.render();
    },

    getValues: function () {
        //debugger
        var data = {};

        data.date = this.$.datePicker.getValue();
        data.id = this.$.id.getValue();
        data.title = this.$.title.getValue();
        data.importance = this.$.importance.children[0].getAttribute('active') ? "HIGH" : "NORMAL";
        //data.importance = this.$.importance.getActive().priority;
        data.owner = this.$.owner.getValue();
        //console.log('----event detail----raw data---', data);
        return data;
    },

    validate: function (values) {
        var regDate = /^[0-9]{4}\-(0[1-9]|1[012]|[1-9])\-(0[1-9]|[12][0-9]|3[01]|[1-9])$/,
            msg = '';

        if (!this._checkRequired(values.title, HPA.I18n.localize("validation.err.title")) || !this._checkRequired(values.date, HPA.I18n.localize("validation.err.date"))) {
            return false;
        }

        //simple validation for date, date format should be yyyy-mm-dd
        if(!values.date.match(regDate)) {
            msg = HPA.I18n.localize("validation.err.dateFormat");
            HPA.Message.warning(msg);

            return false;
        } 

        return true;
    },

    //helper function
    _checkRequired: function(val, errorMsg) {
        var validFlag = true;

        if (!val || val.trim().length === 0) {
            HPA.Message.warning(errorMsg);
            validFlag = false;
        }

        return validFlag;
    }
});
