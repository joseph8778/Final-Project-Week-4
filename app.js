const apiKey = 'c281bc86'

async function fetchMovieInfo(userInput) {
try {
    let searchResponse = await fetch(`http://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(userInput)}`)

    if(!searchResponse.ok) {
        throw new Error(`HTTP error! Status: ${searchResponse.status}`)
    }

    let searchData = await searchResponse.json()

    if (searchData.Response === "False") {
        throw new Error(`API error: ${searchData.Error}`)
    }

    displayResults(searchData)

}

 catch (error) {
    console.error('There was an error fetching the movie data:', error.message)
} }



document.getElementById("searchForm").addEventListener('submit', function(event) {
    event.preventDefault(); //Prevents page refresh
    const userInput = document.querySelector('.nav__search--input').value
    document.getElementById('titlecon__input').innerHTML = `"${userInput}"`
    fetchMovieInfo(userInput)
    
})




async function displayResults(searchData) {
    const searchArray = searchData.Search;
    console.log(searchArray);

    // Create an array of promises to fetch additional movie data
    const movieDetailsPromises = searchArray.map(async (movieElem) => {
        // Fetch additional movie data using the IMDb ID
        const fetchId = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${encodeURIComponent(movieElem.imdbID)}`);
        const idData = await fetchId.json();
        
        // Return a new object containing both the original data and the additional details
        return {
            ...movieElem,
            Genre: idData.Genre,
            Rated: idData.Rated,
            StarRating: idData.imdbRating
        };
    });

    // Wait for all movie detail fetches to complete
    const detailedMovies = await Promise.all(movieDetailsPromises);

    console.log(detailedMovies)

    // Build the HTML for the movie cards
    const resultsHtml = detailedMovies.map(movie => {
        return `
            <div class="selection__card click">
                <img src="${movie.Poster}" alt="${movie.Title} Poster" class="selection__card--img">
                <div class="selection__card--desc">
                    <h2 class="selection__card--title">${movie.Title}</h2>
                    <ul class="selection__card--info">
                        <li class="info__text selection__year">Year: ${movie.Year}</li>
                        <li class="info__text selection__genre">Genre: ${movie.Genre}</li>
                        <li class="info__text selection__rated">Rated: ${movie.Rated}</li>
                    </ul>
                    <div class="selection__card--star-rating">
                      ${showRating(movie.StarRating)}
                    </div>
                </div>
            </div>`;
    }).join(''); // Join the array into a single HTML string

    // Insert the HTML into the container
    document.querySelector('.selections').innerHTML = resultsHtml;
}



function showRating(rating) {
const parsedRating = parseFloat(rating) || 0;

    const stars = `<i class="fa-solid fa-star"></i>`.repeat(Math.floor(parsedRating/2))
    const halfStar = parsedRating % 2 >= 1 ? '<i class="fa-solid fa-star-half-stroke"></i>' : ''
    return stars + halfStar
}













// SLIDER JAVA -------------------------------------

const minYearSlider = document.getElementById('minYear');
const maxYearSlider = document.getElementById('maxYear');
const yearRange = document.getElementById('yearRange');
const sliderTrack = document.querySelector('.slider-track');

function updateSlider() {
    const minYear = parseInt(minYearSlider.value);
    const maxYear = parseInt(maxYearSlider.value);

    // Ensure minYear is always less than or equal to maxYear
    if (minYear > maxYear) {
        minYearSlider.value = maxYear;
    }

    yearRange.textContent = `${minYearSlider.value} - ${maxYearSlider.value}`;

    // Update the color between the two sliders
    const minPercent = ((minYearSlider.value - minYearSlider.min) / (minYearSlider.max - minYearSlider.min)) * 100;
    const maxPercent = ((maxYearSlider.value - minYearSlider.min) / (minYearSlider.max - minYearSlider.min)) * 100;

    sliderTrack.style.background = `linear-gradient(to right, #ddd ${minPercent}%, #00bfff ${minPercent}%, #00bfff ${maxPercent}%, #ddd ${maxPercent}%)`;
}

// Add event listeners to sliders
minYearSlider.addEventListener('input', updateSlider);
maxYearSlider.addEventListener('input', updateSlider);

// Initialize the slider with default values
updateSlider();
