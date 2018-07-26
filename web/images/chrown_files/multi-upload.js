/**
 * Awesome multi-upload script by crudie :p
 *
 * @author crudie
 */
function multiUpload(config) {
    this.config = config;
    this.items = "";
    this.all = [];
    var self = this;
    this.uploaded = 0;

    // Init plugin
    multiUpload.prototype._init = function () {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            // Gettin' input file's id
            var inputId = $("#" + this.config.form).find("input[type='file']:first").attr("id");

            // On submit
            document.getElementById(this.config.form).addEventListener("submit", this._onSubmit, false);

            document.getElementById(inputId).addEventListener("change", this._read, false);

            document.getElementById(this.config.dragArea).addEventListener("dragover", function (e) {
                e.stopPropagation();
                e.preventDefault();
            }, false);

            document.getElementById(this.config.dragArea).addEventListener("drop", this._dropFiles, false);

            $('body').on('click', '.preview .delete', this._deletePreview);
        } else {
            console.log("Eh~ Browser cannot support this feature :s");
        }
    }

    // Delete preview on event
    multiUpload.prototype._deletePreview = function (e) {
        e.preventDefault();

        var key = $(this).data('key');

        delete self.all[key];

        $(this).parent().remove();
    }

    // On files read
    multiUpload.prototype._read = function (evt) {
        if (evt.target.files) {
            for (var i = 0; i < evt.target.files.length; i++) {
                var file = [evt.target.files[i]];

                self._preview(file);
                self.all.push(file);
            }
        } else {
            console.log("Failed file reading");
        }
    }

    // Validate image extension
    multiUpload.prototype._validate = function (format) {
        var arr = this.config.support.split(",");

        return arr.indexOf(format);
    }

    // On files drop
    multiUpload.prototype._dropFiles = function (e) {
        e.stopPropagation();
        e.preventDefault();

        console.log(e.dataTransfer.files);

        for (var i = 0; i < e.dataTransfer.files.length; i++) {
            var file = [e.dataTransfer.files[i]];

            self._preview(file);
            self.all.push(file);
        }
    }

    // On form submit
    multiUpload.prototype._onSubmit = function (e) {
        e.stopPropagation();
        e.preventDefault();

        self._startUpload();
    }

    // Preview uploaded images
    multiUpload.prototype._preview = function (data) {
        self.items = data;

        if (self.items.length > 0) {
            for (var i = 0; i < self.items.length; i++) {
                var item = self.items[i];
                var key = self.all.length;

                if (self._validate(item.type) > 0) {
                    var reader = new FileReader();

                    reader.onload = function (e) {
                        $('#' + self.config.previewArea).append(
                            $(
                                '<div class="preview">' +
                                '<img src="' + e.target.result + '" />' +
                                '<span class="delete icon-cancel" data-key="' + key + '"></span>' +
                                '</div>'
                            )
                        );
                    }

                    reader.readAsDataURL(item);
                }
            }
        }
    }

    multiUpload.prototype._upload = function (key) {
        var $form = $('#' + self.config.form);

        if (key >= self.all.length) {
            self.all = [];

            $form.find('.load_wrap').hide();

            $form.find('button.violet_btn').prop('disabled', false);

            $.hideError($form.find('input'), $form.find('.error_text'));

            $('#files-preview').html('');
            $('#photo-upload-input').val('');

            $.hidePopup();

            if(self.reload) {
                window.location.reload();
            }

            return;
        }

        var data = new FormData();
        var file = this.all[key];

        if (key == 0) {
            $form.find('button.violet_btn').prop('disabled', true);
            $form.find('.load_wrap').show();
        }

        if (file) {
            data.append('photo[' + key + ']', file[0]);
        }

        $.ajax({
            type: "POST",
            url: this.config.uploadUrl,
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            success: function (response) {
                self.uploaded = self.uploaded + 1;

                if (response['error']) {
                    if($.isFunction(self.config.onError)) {
                        self.config.onError(response['error']);
                    } else {
                        $.showError(response.error, $form.find('input'), $form.find('.error_text'));
                    }
                }

                if (response['error']) {
                    self._upload(key + 1);
                    return;
                }

                $('.cont_wrap .container').html(response['content']);

                $('#profile-images').slidesjs({
                    pagination: false
                });

                if(response['reload']) {
                    // :(
                    self.reload = true;
                }

                self._upload(key + 1);
            },
            error: function (response) {
                $.showError(response.error, $form.find('input'), $form.find('.error_text'));

                self._upload(key + 1);
            }
        });
    };

    // Start upload all files
    multiUpload.prototype._startUpload = function () {
        if (this.all.length > 0) {

            self._upload(0);
            return;
            var $form = $('#' + self.config.form);

            $form.find('button.violet_btn').prop('disabled', true);
            $form.find('.load_wrap').show();

            for (var k = 0; k < this.all.length; k++) {
                var data = new FormData();
                var file = this.all[k];

                if (file) {
                    data.append('photo[' + k + ']', file[0]);

                    $.ajax({
                        type: "POST",
                        url: this.config.uploadUrl,
                        data: data,
                        cache: false,
                        contentType: false,
                        processData: false,
                        success: function (response) {
                            self.uploaded = self.uploaded + 1;

                            if (response['error']) {
                                $.showError(response.error, $form.find('input'), $form.find('.error_text'));

                            }

                            if (self.uploaded == self.all.length) {
                                self.all = [];

                                $form.find('.load_wrap').hide();

                                $form.find('button.violet_btn').prop('disabled', false);

                                $.hideError($form.find('input'), $form.find('.error_text'));

                                $('#files-preview').html('');
                                $('#photo-upload-input').val('');

                                $.hidePopup();
                            }


                            if (response['error']) {
                                return;
                            }


                            $('.cont_wrap .container').html(response['content']);

                            $('#profile-images').slidesjs({
                                pagination: false
                            });

                        },
                        error: function (response) {
                            console.log(response);
                            self.uploaded = self.uploaded + 1;

                            $.showError(response.error, $form.find('input'), $form.find('.error_text'));

                            if (self.uploaded == self.all.length) {
                                $form.find('.load_wrap').hide();

                                $form.find('button.violet_btn').prop('disabled', false);
                            }

                        }
                    });
                }
            }

        }
    }

    this._init();
}

