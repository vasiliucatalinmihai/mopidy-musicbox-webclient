var ampControl = {
    settingsUrl: "/musicbox_webclient/ampSettings",
    changingSliders : [],

    // bind events
    bindEvents : function(){
        var self = this;
        // hide amp settings controls
        $('.ampSettigsOptions').hide();

        // sliders
        $('.amp-slider').each(function(){
            self.changingSliders[$(this).attr('id')] = null;

            $(this).on('slidestart', function () { self.changingSliders[$(this).attr('id')] = true; });
            $(this).on('slidestop', function () { self.changingSliders[$(this).attr('id')] = null; });
            $(this).on('change', function () { self.sendSlider($(this).attr('id'), $(this).val()); });
            self.getSlider($(this).attr('id'));
        });

        // checkboxes
        $('.amp-checkbox').each(function(){
           $(this).on('change', function() { self.sendCheckbox($(this).attr('id'), $(this).is(':checked'));});
           self.getCheckbox($(this).attr('id'));
        });
        
        // select
        $('.amp-select').each(function() {
           $(this).bind('change', function(event, ui) { self.sendSelect($(this).attr('id'), $(this).val()); });
           self.getSelect($(this).attr('id'));
        });
    },

    _getAllAmpSettings: function() {
        var self = this;
        $('.amp-slider').each(function(){
            if ($(this).attr('id')) {
                self.getSlider($(this).attr('id'));
            }
        });
        $('.amp-checkbox').each(function(){
            if ($(this).attr('id')) {
                self.getCheckbox($(this).attr('id'));
            }
        });
        $('.amp-select').each(function() {
            if ($(this).attr('id')) {
                self.getSelect($(this).attr('id'));
            }
        });
    },

    getAllAmpSettings: function() {
        var self = this;
        var data = {slider: [], checkbox: [], select: []};

        $('.amp-slider').each(function(){
            if ($(this).attr('id')) {
                data.slider.push($(this).attr('id'));
            }
        });
        $('.amp-checkbox').each(function(){
            if ($(this).attr('id')) {
                data.checkbox.push($(this).attr('id'));
            }
        });
        $('.amp-select').each(function() {
            if ($(this).attr('id')) {
                data.select.push($(this).attr('id'));
            }
        });

        $.post(
            self.settingsUrl,
            {type: 'get', method: 'getAllAmpSettings', data: JSON.stringify(data)},
            function(data, status){
                if (status != 'success') {
                    console.log(status);
                    console.log(data);
                    return;
                }
                data = JSON.parse(data);

                data.slider.forEach(function(item){
                    self.setSliderVal(item.id, item.value);
                });

                data.checkbox.forEach(function(item){
                    self.updateCheckBox(item.id, item.value);
                });

                data.select.forEach(function(item){
                    self.updateSelect($('#' + item.id), item.value);
                });
            }
        );
    },

    // get slider value from server
    getSlider: function(id){
        var self = this;
        $.post(
            self.settingsUrl,
            {type: 'get', method: id},
            function(data, status){
                self.changingSliders[id] = null;
                if (status != 'success') {
                    console.log(data + ' - ' + status);
                    return;
                }
                self.setSliderVal(id, data);
            }
        );
    },

    // send slider value to server
    sendSlider: function(id, value){
        var self = this;
        if (self.changingSliders[id] === null) {
            self.changingSliders[id] = true;
            $.post(
                self.settingsUrl,
                {type: 'set', method: id, value: value},
                function(data, status){
                    if (status != 'success') {
                        console.log(data + ' - ' + status);
                        self.changingSliders[id] = null;
                        return;
                    }
                    self.changingSliders[id] = null;
//                    self.setSliderVal(id, data);
                }
            );
        }
    },
    
    // update slider ui
    setSliderVal: function(id, value) {
        var self = this;
        var sliderElem = $('#' + id);
        if (!self.changingSliders[id] && sliderElem.val() != value) {
            sliderElem.off('change');
            sliderElem.val(value).slider('refresh');
            sliderElem.on('change', function () { self.sendSlider($(this).attr('id'), $(this).val()); });
        }
    },
    
    // send checkbox update to server
    sendCheckbox: function(id, value) {
        console.log(id);
        var self = this;
        value = value ? 1 : 0;
        $.post(
            self.settingsUrl,
            {type: 'set', method: id, value: value},
            function(data, status){
                if (status != 'success') {
                    console.log(data + ' - ' + status);
                    return;
                }
                var value = true;
                if (data == 0) {
                    value = false;
                }
                $('#' + id).attr('checked', value);
            }
        );
    },
    
    // get checkbox value from server
    getCheckbox: function(id) {
        var self = this;
        $.post(
            self.settingsUrl,
            {type: 'get', method: id},
            function(data, status){
                if (status != 'success') {
                    console.log(data + ' - ' + status);
                    return;
                }
                var value = true;
                if (data == 0) {
                    value = false;
                }
                self.updateCheckBox(id, value);
            }
        );
    },
    
    // update checkbox ui clases
    updateCheckBox: function(id, value) {
        var elem = $('#' + id);
        elem.prop('checked', value);
        if (value) {
            elem.siblings('.ui-btn').find('.ui-icon').removeClass('ui-icon-checkbox-off');
            elem.siblings('.ui-btn').find('.ui-icon').addClass('ui-icon-checkbox-on');
        } else {
            elem.siblings('.ui-btn').find('.ui-icon').removeClass('ui-icon-checkbox-on');
            elem.siblings('.ui-btn').find('.ui-icon').addClass('ui-icon-checkbox-off');
        }
    },
    
    // send select value to server
    sendSelect: function(id, value) {
        var self = this;
        $.post(
            self.settingsUrl,
            {type: 'set', method: id, value: value},
            function(data, status){
                if (status != 'success') {
                    console.log(data + ' - ' + status);
                    return;
                }
                self.updateSelect($('#' + id), data);
            }
        );
    },
    
    // get select value from server
    getSelect: function(id) {
        var self = this;
        $.post(
            self.settingsUrl,
            {type: 'get', method: id},
            function(data, status){
                if (status != 'success') {
                    console.log(data + ' - ' + status);
                    return;
                }
                self.updateSelect($('#' + id), data);
            }
        );
    },

    // update select
    updateSelect: function(select, value){
        var self = this;
        select.off('change');
        select.val(value).selectmenu("refresh");
        select.on('change', function () { self.sendSelect($(this).attr('id'), $(this).val());});
    },

    // mute
    mute: function(){
        var self = this;
        $.post(
            self.settingsUrl,
            {type: 'set', method: 'mute', value: mute},
            function(data, status){
                if (status != 'success') {
                    console.log(data + ' - ' + status);
                    return;
                }
            }
        );
    }
};



function swthchAmpSettings(tab) {
    $('.ampSettigsOptions').not(tab).hide();
    $(tab).toggle();
    amp.getAllAmpSettings();
}