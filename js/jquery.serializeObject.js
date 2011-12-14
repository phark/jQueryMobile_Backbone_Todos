/**
 * jQuery function to serialize an object into JSON
 * see: http://benalman.com/projects/jquery-misc-plugins/#serializeobject
 *
 * Ex:
 *
 *   var html = '<form>'
 *   '<input type="hidden" name="a" value="1"/>'
 *   '<input type="hidden" name="a" value="2"/>'
 *   '<input type="hidden" name="a" value="3"/>'
 *   '<input type="hidden" name="b" value="4"/>'
 *   '</form>';
 *
 *   $(html).serializeObject(); // returns { a: [ "1", "2", "3" ], b: "4" }
 */
$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        // sanitize the results - plb
        if (this.value && typeof this.value.sanitizeAscii !== 'undefined') this.value = this.value.sanitizeAscii()
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        }
        else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};