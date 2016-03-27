Template.reservationForm.rendered = function() {
  $("#reservation-title").val(this.data.reservationTitle);
  $('#reservation-title').trigger('autoresize');
};