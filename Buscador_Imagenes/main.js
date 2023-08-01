const form = document.querySelector("form.search");
const app = document.querySelector("section.app");
const MyKEY = "NyivgmYMYrEjBjYPE4zbAZyOE59kBQI3JXva3suqZhj4xqKHfUNzmOVT";

const whitePhotos = (photos) => {
  const photoList = photos.map((photo) => {
    return `
    <li>
      <img src="${photo.src.tiny}" alt="${photo.alt}" />
      <p> ${photo.alt} by (${photo.photographer})<p>
    </li>`;
  });

  app.innerHTML = `<ul>${photoList.join("")}</ul>`;
};

const writeMessage = (message) => {
  app.innerHTML = `<p>${message}</p>`;
};
const dosearch = async (e) => {
  e.preventDefault();
  console.log("Se envió el form");

  const value = new FormData(form);

  const query = value.get("query");
  const color = value.get("color");

  try {
    writeMessage("Cargando datos...");
    const url = ` https://api.pexels.com/v1/search?query=${query}&color=${color}&per_page=25`;

    const response = await fetch(url, {
      headers: {
        Authorization: MyKEY,
      },
    });
    if (response.ok) {
      const data = await response.json();
      whitePhotos(data.photos);
    } else {
      writeMessage(
        "Hubo un error en la petición. Por favor, inténtelo más tarde"
      );
    }
  } catch (error) {
    writeMessage(error.message);
  }
};
form.addEventListener("submit", dosearch);
