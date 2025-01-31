import {saveToLocalStorage, getFromLocalStorage, removeFromLocalStorage} from "./localstorage.js"

let shiny = false
let descriptions = [abilityDes1,abilityDes2,abilityDes3]
let abilityTitles = [ability1,ability2,ability3]
userInput.value = ""
let fav = false
warningText.style.visibility = "hidden"
let generate = async (userInput) => {
    const promise = await fetch(`https://pokeapi.co/api/v2/pokemon/${userInput}`)
    if(!promise.ok)
    {
       warningText.style.visibility = "visible"
        warningText.innerText = "No data found."
        return null
    }
    
    const data = await promise.json()    
    warningText.style.visibility = "hidden"
    if(data.id > 649)
    {
        warningText.style.visibility = "visible"
        warningText.innerText = "Only Pokemon Gen I-V (1-649)"
    }
    else
    {
        fav = localStorage.Names.includes(capitalize(data.name));
        favBtn.src = fav ? "/Assets/star-solid-24.png" : "/Assets/star-regular-24.png";

        for(let i = 0; i < descriptions.length; i++)
        {
            descriptions[i].innerText = ""
            abilityTitles[i].innerText = ""
        }
        console.log(data)
        evolNone.innerText = ""
        pokemonName.innerText = capitalize(data.name)
        if(data.types.length == 1)
        {
            pokemonType.innerText = `type: ${capitalize(data.types[0].type.name)}`
        }
        else
        {
            pokemonType.innerText = `type: ${capitalize(data.types[0].type.name)}/${capitalize(data.types[1].type.name)}`
        }
        pokemonNum.innerText = ` ${data.id}`
        findPokeLoc(data.id)
        findEvol(data.id)
        pokeImg.src = data.sprites.front_default
        pokeImg.alt = data.name
        // ability1.innerText = capitalize(data.abilities[1].ability.name)
        // findDescription(data.abilities[1].ability.url, 0)
        // ability2.innerText = ""
        // abilityDes2.innerText = ""

        // if(data.abilities.length != 1)
        // {
        // ability2.innerText = capitalize(data.abilities[1].ability.name)
        //     findDescription(data.abilities[1].ability.url,1)
        // }
        for(let i = 0; i < data.abilities.length; i++)
        {
            findDescription(data.abilities[i].ability.url,i)
        }

        let moveList = data.moves
        let moveArr = []
        moveBlock.innerText = ""
        for(let i = 0;i < moveList.length; i++)
        {
            moveArr.push(capitalize(moveList[i].move.name))
        }
        moveArr.forEach((item) =>{
            const li = document.createElement('li')
            li.innerText = "-" + item
            moveBlock.appendChild(li)
        })
    }
    return data
}

let findDescription = async (url,num) =>{
    const promise = await fetch(url)
    const data = await promise.json()
    console.log(data)
    if(data.effect_entries != null)
    {
        abilityTitles[num].innerText = capitalize(data.name)
        descriptions[num].innerText = capitalize(data.effect_entries[1].short_effect)
    }
}

let findPokeLoc = async (id) =>{
    const promise = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/encounters`)
    const data = await promise.json()
    // console.log(data)
    if(data.length == 0)
    {
        pokemonLoc.innerText = "location: unknown"
    }
    else
    {
        pokemonLoc.innerText = `found at: ${capitalize(data[0].location_area.name)}`
    }
    return data
}

let findEvol = async (id) => {
    const promise = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`)
    const data = await promise.json()
    // console.log(data)
    if(data.evolves_from_species != null)
    {
        findEvol(data.evolves_from_species.name)
    }
    else
    {
        findRootPokemon(data.evolution_chain.url)
    }
    // findRootPokemon(data.evolution_chain.url)
}

let findRootPokemon = async (url) => {
    const promise = await fetch(url)
    const data = await promise.json()
    // console.log(data)
    if(data.chain.evolves_to.length == 0)
    {
        evolList.innerText = ""
        evolNone.innerText = "N/A"
    }
    else
    {
        evolNone.innerText = ""
        findEvolChain(data.chain.species.url)
    }
}

let findEvolChain = async (url) => {
    const promise = await fetch(url)
    const data = await promise.json()
    // console.log(data)
    buildEvolChain(data.evolution_chain.url)
}

let buildEvolChain = async (url) =>{
    const promise = await fetch(url)
    const data = await promise.json()
    console.log(data)
    addToEvolChain(data.chain)
}

let addToEvolChain = async (chain) =>{
    console.log(chain)
    let h2 = document.createElement("h2");
    let evolTree = [capitalize(chain.species.name)];
    
    console.log(evolTree)
    for(let i = 0 ; i < chain.evolves_to.length ; i++)
    {
        evolTree.push(capitalize(chain.evolves_to[i].species.name));
        // evolList.append(h2)
        // console.log(h2.innerText)
        if(chain.evolves_to[i].evolves_to.length != 0)
        {
            evolTree.push(capitalize(chain.evolves_to[i].evolves_to[0].species.name));
            // evolList.append(h2)
            // console.log(h2.innerText)

        }
    }

    h2.innerText = evolTree.join(" >> ");
    evolList.append(h2)


}

let findPokemonPic = async (name) => {
    const promise = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
    const data = await promise.json()
    console.log(data.sprites.front_default)
    return `${data.sprites.front_default}`
}
//evol
//fetch pokemon-species to find evolves_from_species
//if evolve_from_species == null, create an img and h2 with current pokemon and append to evolChain
//else, fetch pokemon-species from the evolves_from_species.name
//if evolve_from_species == null, create an img and h2 with current pokemon and append to evolChain


const isShiny = async (toggle) => {
    const promise = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.innerText.toLowerCase()}`);
    const data = await promise.json();
    pokeImg.src = data.sprites[toggle ? 'front_default' : 'front_shiny'];
};

let favorite = (pokemon) => {
    saveToLocalStorage(pokemon)
    addToFavs(pokemon)
}

let addToFavs = (name) =>{
    let h2 = document.createElement("h2");
    h2.innerText = name;
    h2.id = "favItem";
    let removeBtn = document.createElement("button2");
    removeBtn.id = "remove";
    removeBtn.innerText = "X";

    removeBtn.addEventListener("click", function () {
        removeFromLocalStorage(name);
        h2.remove();
        removeBtn.remove();
        if(name == pokemonName.innerText)
        {
            favBtn.src = "/Assets/star-regular-24.png"
            fav = false
        }
      });

      h2.appendChild(removeBtn);
      favList.appendChild(h2);
}

let createFavs = () =>{
    let pokeNames = getFromLocalStorage();

    pokeNames.map((name) => {
        let favBlock = document.createElement("div")
        favBlock.className = "flex"
        let pokeIcon = document.createElement("img")
        pokeIcon.src = findPokemonPic(name.toLowerCase())
        let h2 = document.createElement("h2");
        h2.innerText = name;
        h2.id = "favItem";
        h2.addEventListener("click", async()=>{
            generate(name.toLowerCase())
        })
        let removeBtn = document.createElement("button2");
        removeBtn.id = "remove";
        removeBtn.innerText = "X";
        removeBtn.addEventListener("click", async () => {
            removeFromLocalStorage(name);
            h2.remove();
            if(name == pokemonName.innerText)
            {
                favBtn.src = "/Assets/star-regular-24.png"
                fav = false
            }
          });
        //   favBlock.appendChild(pokeIcon)
          favBlock.appendChild(h2)
          favBlock.append(removeBtn);
          favList.appendChild(favBlock);
    });
}

createFavs()

let capitalize = (string) =>{
    return string
    .toLowerCase()
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

}

// favItem.addEventListener("click",() =>{
//     generate(fav)
// })

generateBtn.addEventListener("click",() =>{
    if(userInput.value.trim() === "")
    {
        warningText.style.visibility = "visible"
        warningText.innerText = "Enter a valid name/number."
    }
    else
    {
        warningText.style.visibility = "hidden"
        generate(userInput.value.toLowerCase())
    }
});

shinyBtn.addEventListener("mouseover", () => {
    shinyBtn.src = shiny ? "/Assets/sparkles-icon-2048x2047-didnltrp.png" : "/Assets/sparklesSELECT-icon-2048x2047-didnltrp.png";
});

shinyBtn.addEventListener("mouseout", () => {
    shinyBtn.src = shiny ? "/Assets/sparklesSELECT-icon-2048x2047-didnltrp.png" : "/Assets/sparkles-icon-2048x2047-didnltrp.png";
});

shinyBtn.addEventListener("click", () => {
    isShiny(shiny);
    shinyBtn.src = shiny ? "/Assets/sparkles-icon-2048x2047-didnltrp.png" : "/Assets/sparklesSELECT-icon-2048x2047-didnltrp.png";
    shiny = !shiny;
});

favBtn.addEventListener("mouseover", () => {
    favBtn.src = fav ? "/Assets/star-regular-24.png" : "/Assets/star-solid-24.png";
});

favBtn.addEventListener("mouseout", () => {
    favBtn.src = fav ? "/Assets/star-solid-24.png" : "/Assets/star-regular-24.png";
});

favBtn.addEventListener("click", () => {
    fav ? removeFromLocalStorage(pokemonName.innerText) : favorite(pokemonName.innerText);
    favBtn.src = fav ? "/Assets/star-regular-24.png" : "/Assets/star-solid-24.png";
    fav = !fav;
});

randomBtn.addEventListener("click", () => {
    generate(Math.floor(Math.random() * 649) + 1)
});


generate("pikachu")