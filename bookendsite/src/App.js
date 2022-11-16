import './App.css';
import React, { useState, useEffect } from "react";
import styled from "styled-components";

const Columns = styled.div`
  margin-top:20px;
  margin-bottom:50px;
  column-count: 2;
`
const Details = styled.div`
  text-align: center;
  margin: 10%
`

function App() {
  const [bookData, setBookData] = useState([])
  useEffect(() => {
    fetch('http://localhost:3001/books/')
      .then((res) => res.json())
      .then((data) => {
        setBookData(data)
        console.log(data)
      })
  }, [])
  return (
    <div className="App">
      <header className="App-header" content-type="application">
        <div>
          {bookData.map((book) => {
            return (
              <Columns>
                <div>
                  <Details>Title: {book.title}</Details>
                  <Details>Author: {book.author}</Details>
                </div>

                <img src={`${book.cover}`} height="400px" width="250px" />
              </Columns>
            )
          })}
        </div>
      </header>
    </div>
  );
}

export default App;
