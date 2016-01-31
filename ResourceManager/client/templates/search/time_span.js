Template.timeSpan.onRendered(function() {
    // initialize datetime picker
    var startDateTimePicker = this.$('#startdatetimepicker').datetimepicker();
    var endDateTimePicker = this.$('#enddatetimepicker').datetimepicker({
        useCurrent: false //Important! See issue #1075 in package
    });

    startDateTimePicker.on("dp.change", function (e) {
        endDateTimePicker.data("DateTimePicker").minDate(e.date);
    });

    endDateTimePicker.on("dp.change", function (e) {
        startDateTimePicker.data("DateTimePicker").maxDate(e.date);
    });
});