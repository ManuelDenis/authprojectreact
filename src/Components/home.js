import {useEffect, useState} from "react";
import axios from "axios";

export const Home = () => {
    const [message, setMessage] = useState('');

    useEffect(() => {
        if(localStorage.getItem('access_token') === null){
            window.location.href = '/login'
        }
        else{
            (async () => {
            try {
                const {data} = await axios.get('http://localhost:8000/auth/home/', {
                headers: {
                  'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
                  'Content-Type': 'application/json',
                }
              });

              setMessage(data.message);
            } catch (e) {
                console.log('not auth')
            }
        })()};
    }, []);



    return <div className="form-signin mt-5 text-center">
        <h3>Hi {message}</h3>

    </div>
}