import './sass/main.scss';
import { Notify } from 'notiflix';
const axios = require('axios').default;
// Описан в документации
import SimpleLightbox from 'simplelightbox';
// Дополнительный импорт стилей
import 'simplelightbox/dist/simple-lightbox.min.css';

let searchQueryResult = '';
let pageN = 1;
let q = '';
const gallery = new SimpleLightbox('.gallery a', { enableKeyboard: true });


const pixabayAPI = {
  baseUrl: 'https://pixabay.com/api/', 
  key: '24560226-b25ab3a0f8bb647bdecf60a66',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
  order: 'popular',
  page: '1',
  per_page: '15',
};

const markupData = {
  markup: '',
  htmlCode: '',
};

const searchForm = document.querySelector('.search-form');
const gallerySelector = document.querySelector('.gallery');

searchForm.addEventListener('submit', async e => {
  e.preventDefault();

  const {
    elements: { searchQuery },
  } = e.target;

  searchQueryResult = searchQuery.value;

  if (searchQueryResult === '') {
    console.log(searchQueryResult);
    gallerySelector.innerHTML = '';
    btnLoadMore.classList.remove('is-visible');

    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.',
    );
  }

  if (searchQueryResult !== q) {
    console.log('CHANGED!!! NOT EMPTY QUERY');

    pageN = 1;
    pixabayAPI.page = `${pageN}`;

    gallerySelector.innerHTML = '';
    btnLoadMore.classList.remove('is-visible');
  } else {
    pageN += 1;
    pixabayAPI.page = `${pageN}`;

    btnLoadMore.classList.remove('is-visible');
  }

  q = searchQueryResult;
  pageN += 1;
  pixabayAPI.page = `${pageN}`;

  try {
    const results = await fetchPhotos(searchQueryResult);
    markupData.htmlCode = await renderedPhotos(results);

    gallerySelector.insertAdjacentHTML('beforeend', markupData.htmlCode);
    btnLoadMore.classList.add('is-visible');

    gallery.refresh();

    const { page, per_page } = pixabayAPI;
    const { total, totalHits } = results;
    const totalPages = Math.ceil(totalHits / per_page);

    if (page >= totalPages) {
      btnLoadMore.classList.remove('is-visible');
    }

    Notify.success(`'Hooray! We found ${results.totalHits} images.'`);

  } catch (error) {
    Notify.failure('Sorry, there are no images matching your search query. Please try again.');
  }

  console.log;
  console.log('');
});


const btnLoadMore = document.querySelector('.load-more');
btnLoadMore.addEventListener('click', async () => {

  try {
    const results = await fetchPhotos(searchQueryResult);
    markupData.htmlCode = await renderedPhotos(results);

    gallerySelector.insertAdjacentHTML('beforeend', markupData.htmlCode);
    btnLoadMore.classList.add('is-visible');

  
    gallery.refresh();

    const { page, per_page } = pixabayAPI;
    const { totalHits} = results;
    const totalPages = Math.ceil(totalHits / per_page);

    if (page >= totalPages) {
      btnLoadMore.classList.remove('is-visible');
    }

  } catch (error) {
    Notify.failure("We're sorry, but you've reached the end of search results.");
  }
});


async function fetchPhotos() {
  const { baseUrl, key, image_type, orientation, safesearch, order, page, per_page } = pixabayAPI;

  pixabayAPI.page = `${pageN}`;
  
  const response = await axios.get(
    `${baseUrl}?key=${key}&q=${q}&image_type=${image_type}&orientation=${orientation}&safesearch=${safesearch}&order=${order}&page=${page}&per_page=${per_page}`,
  );
  const results = response.data; 

  const { total, totalHits } = results;
  const totalPages = Math.ceil(totalHits / per_page);

  if (total === 0) {
    throw new Error();
  }

  if (page >= totalPages) {
    btnLoadMore.classList.remove('is-visible');
    Notify.failure("We're sorry, but you've reached the end of search results.");
  }

  return results;
}

async function renderedPhotos(results) {
  const { hits } = results;

  markupData.markup = hits
    .map(
      hit =>
        `<a href="${hit.largeImageURL}"><div class="photo-card">
        <img src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy"
          class="img-item" />
        <div class="info">
    <p class="info-item">
      <b>Likes:</b>${hit.likes}
    </p>
    <p class="info-item">
      <b>Views:</b>${hit.views}
    </p>
    <p class="info-item">
      <b>Comments:</b>${hit.comments}
    </p>
    <p class="info-item">
      <b>Downloads:</b>${hit.downloads}
    </p>
  </div>
</div></a>`,
    )
    .join('');

  return markupData.markup;
}
