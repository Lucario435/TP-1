//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
Init_UI();

function Init_UI() {
    renderFavorites();
    $('#createFavorite').on("click", async function () {
        saveContentScrollPosition();
        renderCreateFavoriteForm();
    });
    $('#abort').on("click", async function () {
        renderFavorites();
        $("#createFavorite").show();
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });


    $('#loginCmd').on("click", function () {
        alert("Cette fonctionalité ne fonctionne pas pour l'instant...")
    });
}
function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createFavorite").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de favoris</h2>
                <hr>
                <p>
                    Petite application de gestion de favoris à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Jonathan Billette
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2023
                </p>
            </div>
        `))
}
async function renderFavorites() {
    showWaitingGif();
    $("#actionTitle").text("Liste des favoris");
    $("#createFavorites").show();
    $("#abort").hide();
    let favorites = await Favorites_API.Get();
    eraseContent();
    if (favorites !== null) {
        favorites.forEach(favorite => {
            $("#content").append(renderFavorite(favorite));
        });
        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditFavoriteForm(parseInt($(this).attr("editFavoriteId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteFavoriteForm(parseInt($(this).attr("deleteFavoriteId")));
            $("#createFavorite").show();
        });
        $(".favoriteRow").on("click", function (e) { e.preventDefault(); })
    } else {
        renderError("Service introuvable");
    }
}
function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}
function renderCreateFavoriteForm() {
    renderFavoriteForm();
}
async function renderEditFavoriteForm(id) {
    showWaitingGif();
    let favorite = await Favorites_API.Get(id);
    if (favorite !== null)
    {
         $("#createFavorites").show();
        renderFavoriteForm(favorite);
    }
    else
        renderError("Favori introuvable!");
}
async function renderDeleteFavoriteForm(id) {
    showWaitingGif();
    $("#createFavorite").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let favorite = await Favorites_API.Get(id);
    eraseContent();
    if (favorite !== null) {
        $("#content").append(`
        <div class="favoritedeleteForm">
            <h4>Effacer le favori suivant?</h4>
            <br>
                <div class="favoriteRow" favorite_id=${favorite.Id}">
                    <div class="favoriteContainer noselect">
                        <div class="favoriteLayout">
                            <div style="display:flex;">
                                <div class="small-favicon"
                                    style="background-image: url('http://www.google.com/s2/favicons?sz=64&domain=${favorite.Url}');">
                                </div>
                                <span class="favoriteTitle">${favorite.Title}</span>
                            </div>
                            <a style="text-decoration:none;" href="${favorite.Url}" class="favoriteUrl">${favorite.Category}</a>
                            <!-- <span style="" class="favoriteCategory">${favorite.Category}</span> -->
                        </div>
                    </div>
                </div>           
            <br>
            <input type="button" value="Effacer" id="deleteFavorite" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteFavorite').on("click", async function () {
            showWaitingGif();
            let result = await Favorites_API.Delete(favorite.Id);
            if (result)
            {
                $("#createFavorite").show();
                renderFavorites();
            }
            else
            {
                $("#createFavorite").show();
                renderError("Une erreur est survenue!");
            }
        });
        $('#cancel').on("click", function () {
            $("#createFavorite").show();
            renderFavorites();
        });
    } else {
        renderError("Favori introuvable!");
    }
}

function newFavorite() {
    favorite = {};
    favorite.Id = 0;
    favorite.Title = "";
    favorite.Url = "";
    favorite.Category = "";
    return favorite;
}

function renderFavoriteForm(favorite = null) {
    $("#createFavorite").hide();
    $("#abort").show();
    eraseContent();
    let create = favorite == null;
    if (create) favorite = newFavorite();
    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#content").append(`
        <form class="form" id="favoriteForm">
            <input type="hidden" name="Id" value="${favorite.Id}"/>

            <label for="Title" class="form-label">Titre </label>
            <input 
                class="form-control Alpha"
                name="Title" 
                id="Title" 
                placeholder="Titre"
                required
                RequireMessage="Veuillez entrer un titre"
                InvalidMessage="Le titre comporte un caractère illégal" 
                value="${favorite.Title}"
            />
            <label for="Url" class="form-label">Url </label>
            <input
                class="form-control Url"
                name="Url"
                id="Url"
                placeholder="https://www.google.com"
                required
                RequireMessage="Veuillez entrer un Url" 
                InvalidMessage="Veuillez entrer un Url valide"
                value="${favorite.Url}" 
            />
            <label for="Category" class="form-label">Catégorie </label>
            <input 
                class="form-control Category"
                name="Category"
                id="Category"
                placeholder="Catégorie"
                required
                RequireMessage="Veuillez entrer votre catégorie" 
                InvalidMessage="Veuillez entrer une catégorie valide"
                value="${favorite.Category}"
            />
            <hr>
            <input type="submit" value="Enregistrer" id="saveFavorite" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    
    initFormValidation();
    $('#favoriteForm').on("submit", async function (event) {
        event.preventDefault();
        let favorite = getFormData($("#favoriteForm"));
        favorite.Id = parseInt(favorite.Id);
        showWaitingGif();
        let result = await Favorites_API.Save(favorite, create);
        if (result)
        {
            $("#createFavorite").show();
            renderFavorites();
        }
        else
            renderError("Une erreur est survenue!");
    });

    $('#cancel').on("click", function () {
        renderFavorites();
        $("#createFavorite").show();
    });
}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

function renderFavorite(favorite) {
    return $(`
     <div class="favoriteRow" favorite_id=${favorite.Id}">
        <div class="favoriteContainer noselect">
            <div class="favoriteLayout">
                <div style="display:flex;">
                    <div class="small-favicon"
                        style="background-image: url('http://www.google.com/s2/favicons?sz=64&domain=${favorite.Url}');">
                    </div>
                    <span class="favoriteTitle">${favorite.Title}</span>
                </div>
                <a style="text-decoration:none;" href="${favorite.Url}" class="favoriteUrl">${favorite.Category}</a>
            </div>
            <div class="favoriteCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editFavoriteId="${favorite.Id}" title="Modifier ${favorite.Title}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deleteFavoriteId="${favorite.Id}" title="Effacer ${favorite.Title}"></span>
            </div>
        </div>
    </div>           
    `);
}