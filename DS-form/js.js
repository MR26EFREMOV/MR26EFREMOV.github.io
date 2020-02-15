function validateName(input) {
    if ((input.validity.patternMismatch)) {
        input.setCustomValidity("Используйте только русские буквы, пробелы, тире");
    }
    else {
        input.setCustomValidity("");
    }
}
function validatePhone(input) {
    if ((input.validity.patternMismatch)) {
        input.setCustomValidity("Используйте только цифры, тире, пробелы, “+”");
    }
    else {
        input.setCustomValidity("");
    }
}

function validateEmail(input) {
    if ((input.validity.patternMismatch)) {
        input.setCustomValidity("Формат должен соотвественность электронной почте");
    }
    else {
        input.setCustomValidity("");
    }
}
$(function() {
    $('form').submit(function(e) {
        var $form = $(this);
        var $data = {};
        $form.find ('input').each(function() {
            $data[this.name] = $(this).val();
        });
        $.ajax({
            type: $form.attr('method'),
            url: $form.attr('action'),
            data: $data
        });
        e.preventDefault();
    });
});
