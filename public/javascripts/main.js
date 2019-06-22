let fileNumber = 0;
let fileInfo = new Object();

function onUserChange(event) {
    fileInfo[event.target.id]['data'] = event.target.value;
}

window.Dropzone.options.dropzoneUpload = {
    autoProcessQueue: false,
    parallelUploads: 1,
    init: function() {
        // Extract the thumbnail and add it to the preview container
        this.on("thumbnail", function(file, dataUrl) {
            // Show thumbnail in dropzone preview
            if (file.previewElement) {
                // Get the current file name and create the id
                let fileName = file.previewElement.querySelector(
                    ".dz-details").childNodes[3].firstChild.textContent;
                let id = "id_select_" + fileNumber.toString();
                let obj = {
                    fileName,
                    "data": null
                }

                // Check if the key exists in the dictionary
                let exists = false;
                for (key in fileInfo) {
                    if (fileInfo[key]['fileName'] == fileName) {
                        exists = true;
                        break;
                    }
                }
                if (exists) {
                    console.log("File already exists!!!");
                    this.removeFile(file);
                    return;
                } else {
                    fileInfo[id] = obj;
                }

                let _this = this;

                // Get thumbnail and clone it
                let imageEle = file.previewElement.querySelector(
                    ".dz-image").childNodes[0].cloneNode(false);
                // document.querySelector("#preview").appendChild(imageEle);

                // Query the preview container and the row template
                let container = document.querySelector("#preview");
                let row = document.querySelector(
                    "#cnt-preview-row").cloneNode(true);

                // Remove the hidden class and id attribute
                row.classList.remove("hidden");
                row.removeAttribute("id");

                // Add the thumbnail and file name to the row template
                row.querySelector(
                    "#cnt-preview-thumbnail").appendChild(imageEle);
                row.querySelector(
                    "#cnt-preview-file-name").innerHTML = fileName;

                // Get the dropdown element, add the id to it and
                // the file name and id to the dictionary for future use.
                let dropdown = row.querySelector(".preview-dropdown");
                dropdown.setAttribute("id", id);
                fileNumber = fileNumber + 1;

                // Get the error button, remove the id and add the
                // event listener
                let errorBtn = row.querySelector("#ctn-preview-delete");
                errorBtn.removeAttribute("id");
                errorBtn.addEventListener("click", function(e) {
                    let grandparent = this.parentElement.parentElement;
                    let dropdown = grandparent.getElementsByClassName(
                        "form-control preview-dropdown");
                    let id = dropdown[0].getAttribute("id");
                    _this.removeFile(file);
                    row.parentNode.removeChild(row);
                    delete fileInfo[id];
                });

                // Add the row to the preview container
                container.appendChild(row);
            }
        });

        // When the submit button is clicked upload all the files.
        this.on("complete", function(file, res) {
            _this.options.autoProcessQueue = true;
        });

        // Once the queue is empty, disable auto processing,
        // remove all the files from the dropzone preview and the 
        // container preview. Finally, reset the file counter to 0.
        this.on("queuecomplete", function() {
            _this.options.autoProcessQueue = false;
            _this.removeAllFiles();

            let container = document.querySelector("#preview");
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            fileNumber = 0;
            idFileNameDict = new Object();
            fileInfo = new Object();
        });

        // Send account data with each file upload
        this.on("sending", function(file, xhr, formData) {
            let fileName = null;
            let previewChildNodes = file.previewElement.children;

            // Get the file name of the file being sent
            for (let node of previewChildNodes) {
                if (node.classList.contains("dz-details")) {
                    fileName = node.children[1].textContent;
                }
            }

            // Attach the data to formData
            for (key in fileInfo) {
                if (fileInfo[key]['fileName'] == fileName) {
                    if (fileInfo[key]['data'] != null) {
                        formData.append("user", fileInfo[key]["data"]);
                    }
                    console.log("sending file " + fileName + " - " + fileInfo[key]['data']);
                }
            }
        });

        // Submit files on button click
        let submitBtn = document.querySelector("#dz-submit-btn");
        let _this = this;
        submitBtn.addEventListener("click", function() {
            // Check if a user has been selected for each upload
            let send = true;
            for (key in fileInfo) {
                if (fileInfo[key]['data'] == null) {
                    send = false;
                    console.log("Please select a user for " + fileInfo[key]['fileName']);
                }
            }
            // Process the queue if all users are selected for each upload
            if (send) {
                _this.processQueue();
            }
        });
    }
};
