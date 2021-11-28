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
  
    try {
      const results = await fetchPhotos(searchQueryResult);
      markupData.htmlCode = await renderedPhotos(results);
  
      gallerySelector.insertAdjacentHTML('beforeend', markupData.htmlCode);
      btnLoadMore.classList.add('is-visible');
  
      // simpleLightbox gallery destroys and reinitilized
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