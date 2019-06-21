let fileNumber = 0;                     // The current file index
let idFileNameDict = new Object();      // Relate file names to dropdown ids
let filenameUserDict = new Object();

let fileInfo = new Object();

// When ever the user selects a new value in the dropdown
// append the selected attribute to the corresponding element
// to be sent to the server later on.
function changeDropdownSelected(id) {
    console.log(id);
    let dropdown = document.querySelector("#" + id);
    let value = document.querySelector("#" + id).value;
    let selected = dropdown.querySelectorAll('[selected="selected"]');

    // Remove selected attribute from all option elements that have it
    selected.forEach((node) => {
        node.removeAttribute("selected");
    });

    // Add selected attribute to newly selected option
    dropdown.childNodes.forEach((groups) => {
        groups.childNodes.forEach((option) => {
            if (option.value === value) {
                option.setAttribute("selected", "selected");
            }
        });
    });
}

// When an error occurs call this function to show a message
// in the error div container.
function showErrorDiv(dz, file, message, removeFile=true) {
    if (typeof showErrorDiv.mainDiv == 'undefined'
        && typeof showErrorDiv.counter == 'undefined') {
        showErrorDiv.mainDiv = document.querySelector("#cnt-preview-error");
        showErrorDiv.counter = 0;
    }

    // Remove file from dropzone
    if (removeFile) {
        dz.removeFile(file);
    }

    // Remove hidden class from error container if there
    showErrorDiv.mainDiv.classList.remove("hidden");

    // Create text node, add the id, increment the counter and
    // append the element to the error div
    let textNode = document.createElement("p");
    let id = "error_tnode_" + showErrorDiv.counter.toString();
    showErrorDiv.counter++;
    textNode.innerHTML = message;
    textNode.setAttribute("id", id);
    showErrorDiv.mainDiv.appendChild(textNode);

    // Set the timer to remove the textnode
    setTimeout(() => {
        let children = showErrorDiv.mainDiv.children;
        for (let i = 0; i < children.length; i++) {
            if (children[i].getAttribute("id") == id) {
                showErrorDiv.mainDiv.removeChild(children[i]);
            }
        }

        // If there are no more children in the error container hide the div
        if (showErrorDiv.mainDiv.children.length === 0) {
            showErrorDiv.mainDiv.classList.add("hidden");
        }
    }, 5000);
}

function onUserChange(event) {
    console.log("Changed id - " + event.target.id);
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

                // if (!(fileName in idFileNameDict)) {
                //     idFileNameDict[fileName] = id;
                // } else {
                //     showErrorDiv(
                //         this,
                //         file,
                //         "A duplicate of "
                //         + fileName
                //         + " was found and removed."
                //     );
                //     return;
                // }
                // Create default thumbnail
                // window.Dropzone.prototype.defaultOptions['thumbnail'](file,
                //     dataUrl);

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
                    console.log(e);
                    console.log(e.view.key);
                    _this.removeFile(file);
                    row.parentNode.removeChild(row);
                    // delete idFileNameDict[fileName];
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

            console.log("sending file - " + fileName);
            for (key in fileInfo) {
                if (fileInfo[key]['fileName'] == fileName) {
                    if (fileInfo[key]['data'] == null) {
                        
                    }
                    console.log("sending file " + fileName + " - " + fileInfo[key]['data']);
                }
            }

            // Get the selected value from the dropdown in preview
            // Use the file name as the index for the dictionary to get
            // the id of the related option tags in the preview container
            // let id = idFileNameDict[fileName];
            // let options = document.querySelector("#" + id).children;
            // let value = null;

            // for (let i = 1; i < options.length; i++) {
            //     let children = options[i].children;
            //     for (let y = 0; y < children.length; y++) {
            //         if (children[y].getAttribute("selected") === "selected") {
            //             value = children[y].value;
            //         }
            //     }
            // }

            // if (value == null) {
            //     showErrorDiv(
            //         this,
            //         file,
            //         "Please select an option in the drop down menu for "
            //         + fileName,
            //         false
            //     );
            // }
        });

        // Submit files on button click
        let submitBtn = document.querySelector("#dz-submit-btn");
        let _this = this;
        submitBtn.addEventListener("click", function() {
            // let myDropZone = window.Dropzone.forElement(".dropzone");
            _this.processQueue();
        });
    }
};
