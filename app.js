//GLOBAL VARIABLES ----------------------------------------
const apiKey = 'c281bc86'
const selectionsWrapper = document.querySelector(".selections")
const movieResults = document.querySelector('.movie__results')
const errorText =  document.querySelector('.selections__error-text')
const filmStrip = document.querySelector('.loading__strip--wrapper')

//DEFAULT MOVIE CARDS---------------------------
window.onload = function() {
    fetchMovieInfo('Jaws'); // Replace 'Harry Potter' with any default search term you prefer
};



//MOVIE FETCH FUNCTION -----------------------------
async function fetchMovieInfo(userInput) {
    movieResults.textContent = '';
    errorText.innerText = ''
    selectionsWrapper.classList += ' selections__loading'
  
try {
    let searchResponse = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(userInput)}`)

    if(!searchResponse.ok) {
        throw new Error(`HTTP error! Status: ${searchResponse.status}`)
    }

    let searchData = await searchResponse.json()

    if (searchData.Response === "False") {
        throw new Error(`${searchData.Error}`)
    }
setTimeout(() => {
    displayResults(searchData)
    
}, 400);

}

 catch (error) {
    console.error('There was an error fetching the movie data:', error.message)
    setTimeout(() => {
        selectionsWrapper.classList.remove('selections__loading') 
          filmStrip.style.display = 'none'
        errorText.innerText = error.message
    }, 300);
    
} }



document.getElementById("searchForm").addEventListener('submit', function(event) {
    event.preventDefault(); //Prevents page refresh
    const userInput = document.querySelector('.nav__search--input').value
    document.getElementById('titlecon__input').innerHTML = `"${userInput}"`
    fetchMovieInfo(userInput)
    
})



//CARD CREATION FUNCTION-----------------------------------
async function displayResults(searchData) {
    const searchArray = searchData.Search;
    const movieDetailsPromises = searchArray.map(async (movieElem) => {
        const fetchId = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${encodeURIComponent(movieElem.imdbID)}`);
        const idData = await fetchId.json();
        
        // Return a new object containing both the original data and the additional details
        return {
            ...movieElem,
            Genre: idData.Genre,
            Rated: idData.Rated,
            imdbRating: idData.imdbRating
        };
    });

    // Wait for all movie detail fetches to complete



    const detailedMovies = await Promise.all(movieDetailsPromises);



    console.log(detailedMovies)




    const resultsHtml = detailedMovies.map(movie => {
        return ` 
            <div class="selection__card click" onclick = "cardPopUp('${movie.imdbID}')" data-year="${movie.Year}">
                <img src="${movie.Poster !== 'N/A' ? movie.Poster : './Assets/Movie.png'}" alt="${movie.Title} Poster" class="selection__card--img">
                <div class="selection__card--desc">
                    <h2 class="selection__card--title">${movie.Title}</h2>
                    <ul class="selection__card--info">
                        <li class="info__text selection__year">Year: ${movie.Year}</li>
                        <li class="info__text selection__genre">Genre: ${movie.Genre}</li>
                        <li class="info__text selection__rated">Rated: ${movie.Rated}</li>
                    </ul>
                    <div class="selection__card--star-rating">
                      ${showRating(movie.imdbRating)}
                    </div>
                </div>
            </div>`;
    }).join('');


    document.querySelector('.movie__results').innerHTML = resultsHtml;

    titleLimit();

    selectionsWrapper.classList.remove('selections__loading')
     filmStrip.style.display = 'none'

filterMoviesByYear();
}


//STAR RATING CALCULATOR----------------------------------
function showRating(rating) {
const parsedRating = parseFloat(rating) || 0;

    const stars = `<i class="fa-solid fa-star"></i>`.repeat(Math.floor(parsedRating/2))
    const halfStar = parsedRating % 2 >= 1 ? '<i class="fa-solid fa-star-half-stroke"></i>' : ''
    return stars + halfStar
}

// TITLE LENGTH LIMITER

function titleLimit() {
    const maxTitleLength = 15
    const cardTitle = document.querySelectorAll('.selection__card--title');


    console.log(cardTitle)

    cardTitle.forEach(title => {
        if (title.textContent.length > maxTitleLength) {
            title.textContent = title.textContent.slice(0, maxTitleLength) + "..."}
        })
    }


//CARD CLICK FUNCTION--------------------------------------

// Select the pop-up elements
const popup = document.getElementById('moviePopup');
const popupClose = document.getElementById('popupClose');
const popupTitle = document.getElementById('popupTitle');
const popupYear = document.getElementById('popupYear');
const popupGenre = document.getElementById('popupGenre');
const popupRated = document.getElementById('popupRated');
const popupPoster = document.getElementById('popupPoster');
const popupPlot = document.getElementById('popupPlot');
const popupRating = document.getElementById('popupRating');
const popupContent = document.querySelector('.popup__content')


function openPopUp(movie) {
    
    popupTitle.innerText = movie.Title;
    popupYear.innerText = `Year: ${movie.Year}`;
    popupGenre.innerText = `Genre: ${movie.Genre}`;
    popupRated.innerText = `Rated: ${movie.Rated}`;
    popupPoster.src = movie.Poster !== 'N/A' ? movie.Poster : './Assets/Movie.png';
    popupPlot.innerText = movie.Plot ? `Plot: ${movie.Plot}` : 'No plot available.';
    popupRating.innerHTML = showRating(movie.imdbRating);
    filmStrip.style.display = 'none'
    popup.classList.remove('hidden'); // Show the pop-up
    popup.classList.remove('fade'); // Show the pop-up
}

popupClose.addEventListener('click', () => {
    popup.classList.add('fade')
    setTimeout(() => {
        
        popup.classList.add('hidden')
    }, 500);
});

popup.addEventListener('click', (event) => {
    if (event.target === popup) {
        popup.classList.add('fade')
        setTimeout(() => {
            popup.classList.add('hidden')
        }, 500);
    }
});

function cardPopUp(imdbID) {
          filmStrip.style.display = 'block'
        fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}`)
        .then(response => response.json())
        .then(movie => openPopUp(movie))
        .catch(error => console.error('Error fetching popUp movie details:', error));
}






// SLIDER JAVA -------------------------------------

const minYearSlider = document.getElementById('minYear');
const maxYearSlider = document.getElementById('maxYear');
const yearRange = document.getElementById('yearRange');
const sliderTrack = document.querySelector('.slider-track');

function updateSlider() {
    const minYear = parseInt(minYearSlider.value);
    const maxYear = parseInt(maxYearSlider.value);


    if (minYear > maxYear) {
        minYearSlider.value = maxYear;
    }

    yearRange.textContent = `${minYearSlider.value} - ${maxYearSlider.value}`;

    // Update the color between the two sliders
    const minPercent = ((minYearSlider.value - minYearSlider.min) / (minYearSlider.max - minYearSlider.min)) * 100;
    const maxPercent = ((maxYearSlider.value - minYearSlider.min) / (minYearSlider.max - minYearSlider.min)) * 100;

    sliderTrack.style.background = `linear-gradient(to right, #ddd ${minPercent}%, #ff0000 ${minPercent}%, #ff0000 ${maxPercent}%, #ddd ${maxPercent}%)`;

    filterMoviesByYear();
}

function filterMoviesByYear() {
    const minYear = parseInt(minYearSlider.value)
    const maxYear = parseInt(maxYearSlider.value)

    const movieCards = document.querySelectorAll('.selection__card')

    movieCards.forEach(card => {
        const movieYear = parseInt(card.getAttribute('data-year'))

        //Show or hide card based on whether is year falls within selected range.
        if (movieYear >= minYear && movieYear <= maxYear) {
            card.style.display = 'block'
        } else {
            card.style.display = 'none'
        }
    })
}


minYearSlider.addEventListener('input', updateSlider);
maxYearSlider.addEventListener('input', updateSlider);


updateSlider();


