import {useEffect, useState} from "react";
import { useDebounce} from "react-use";

import {Search} from "./components/Search.jsx";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMBD_API_KEY;

const API_OPTIONS = {
    methods: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
};

export const App = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const [errorMessages, setErrorMessages] = useState('');

    const [movieList, setMovieList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    useDebounce(
        ()=> setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);


    const fetchMovies = async (query = '') => {
        setIsLoading(true);
        setErrorMessages('');

        try{
            const endpoint = query
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
            const response = await fetch(endpoint, API_OPTIONS);

            if(!response.ok){
                throw new Error('Failed to fetch movies');
            }

            const data = await response.json();
            if(data.Response === 'False'){
                setErrorMessages(data.Error || 'Failed to fetch movies. Please try again later.');
                setMovieList([]);
                return;
            }

            setMovieList(data.results || []);
        }catch (error){
            console.error(`error fetching movies: ${error}`);
            setErrorMessages('Failed to fetch movies. Please try again later.');
        }finally {
            setIsLoading(false);
        }
    }
    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    return (
        <main>
            <div className="pattern"/>


            <div className="wrapper">

                <header>
                    <img src="hero-img.png" alt="hero banner"/>

                    <h1>Find <span className="text-gradient">Movies</span> You&apos;ll Enjoy
                        without the hassle
                    </h1>
                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
                </header>

                <section className="all-movies">
                    <h2 className="mt-[40px]">All Movies</h2>
                    {isLoading ?(
                        <Spinner/>
                    ): errorMessages ? (
                        <p className={"text-red-500"}>{errorMessages}</p>
                    ): (
                        <ul>
                            {movieList.map((movie) => (
                                <MovieCard key={movie.id} movie={movie}/>
                            ))}
                        </ul>
                    )}
                </section>


            </div>
        </main>
    )
}
export default App;
