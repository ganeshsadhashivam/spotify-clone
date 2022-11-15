
import { fetchRequest } from "../api";
import { ENDPOINT, getItemFromLocalStorage, LOADED_TRACKS, logout, SECTIONTYPE, setItemInLocalStorage } from "../common";

const audio = new Audio();
const playButton = document.querySelector("#play");

const onProfileClick = (event) => {
  event.stopPropagation();
  const profileMenu = document.querySelector("#profile-menu");
  profileMenu.classList.toggle("hidden");
  if (!profileMenu.classList.contains("hidden")) {
    profileMenu.querySelector("li#logout").addEventListener("click", logout);
  }
};

const loadUserProfile = async () => {
  const defalutImage = document.querySelector("#default-image");
  const profileButton = document.querySelector("#user-profile-btn");
  const displayNameElement = document.querySelector("#display-name");

  const { display_name: displayName, images } = await fetchRequest(
    ENDPOINT.userInfo
  );

  //const userInfo = await fetchRequest(ENDPOINT.userInfo);
  //console.log(userInfo);
  if (images?.length) {
    defalutImage.classList.add("hidden");
  } else {
    defalutImage.classList.remove("hidden");
  }

  profileButton.addEventListener("click", onProfileClick);
  displayNameElement.textContent = displayName;
 
};

const onPlayListItemClicked = (event,id) => {
  console.log(event.target);
  const section = {type:SECTIONTYPE.PLAYLIST,playlist:id}
  history.pushState(section,"",`playlist/${id}`)
  loadSections(section)
};

//loading playlist

const loadPlayList = async (endpoint,elementId) => {
  const {playlists: { items } } = await fetchRequest(endpoint);

  const playListItemsSections = document.querySelector(`#${elementId}`);

  for (let { name, description, images, id } of items) {

    const playListItem = document.createElement("section");

    playListItem.className ="bg-black-secondary rounded  p-4 hover:cursor-pointer hover:bg-light-black";

    playListItem.id = id;

    playListItem.setAttribute("data-type", "playlist");

    playListItem.addEventListener("click",(event)=> onPlayListItemClicked(event,id));

    const [{ url: imageUrl }] = images;

    playListItem.innerHTML = `<img  src="${imageUrl}" alt="${name}" class="rounded mb-2 object-contain shadow"/>
    <h2 class="text-base font-semibold mb-4 truncate">${name}</h2>
    <h3 class="text-sm text-secondary line-clamp-2">${description}</h3>`;

    playListItemsSections.appendChild(playListItem);
  }

  //console.log(featuredPlaylist);
};

const fillContentForDashBoard = ()=>{

  const pageContent = document.querySelector("#page-content");
  const playListMap = new Map([["featured","featured-playlist-items"],["top playlists","top-playlist-items"]])
  let innerHTML = "";
  for(let [type,id] of playListMap){
    innerHTML+=`
    <article class="p-4">
      <h1 class="text-2xl mb-4 fonr-bold capitalize">${type}</h1>
      <section id="${id}" class="featured-songs grid grid-cols-auto-fill-cards gap-4">
      </section>
    </article>`
  }

  pageContent.innerHTML = innerHTML;
}


const formatTime =(duration)=>{
  const min = Math.floor(duration/60000);
  const sec = ((duration % 6000)/1000).toFixed(0);
  // const formattedTime = sec == `0:${60? min+1 + ":00" : min + ":" + (sec< 10 ? "0":"") + sec}`;
  const formattedTime = sec == 60? min+1 + ":00" : min + ":" + (sec< 10 ? "0":"") + sec;

  return formattedTime;
}


//on track selection selecting a song

const onTrackSelection = (event,id)=>{
  document.querySelectorAll("#tracks .track").forEach(trackItem=>{
    if(trackItem.id === id){
      trackItem.classList.add("bg-gray","selected");
    } else {
      trackItem.classList.remove("bg-gray","selected");
    }
  })
}





const updateIconsForPlayMode = (id)=>{
  const playButton = document.querySelector("#play")
  playButton.querySelector("span").textContent = "pause_circle"
  const playButtonInTrack = document.querySelector(`#play-track-${id}`);
 if(playButtonInTrack){
  playButtonInTrack.textContent = "pause"
 }
 

}


const updateiconsForPauseMode = (id)=>{
  const playButton = document.querySelector("#play")
  playButton.querySelector("span").textContent ="play_circle"
  const playButtonInTrack = document.querySelector(`#play-track-${id}`);
  if(playButtonInTrack){
    playButtonInTrack.textContent ="play_arrow";
  
     }

}

const onAudioMetaDataLoaded = (id)=>{
  const totalSongDuration = document.querySelector("#total-song-duration");
 
totalSongDuration.textContent =`0:${audio.duration.toFixed(0)}`;
}









const togglePlay = ()=>{
 
  if(audio.src){

    if(audio.paused){
      audio.play();
      
      
    }else{
      
      audio.pause();
   
    }
  }
}

//find current playing track track 

const findCurrentPlayingTrack = ()=>{
  const audioControl = document.querySelector("#audio-control");
  const trackId = audioControl.getAttribute("data-track-id");
  if(trackId){
    const loadedTracks = getItemFromLocalStorage(LOADED_TRACKS);
    const currentTrackIndex = loadedTracks?.findIndex(track => track.id === trackId);
    return{currentTrackIndex,tracks:loadedTracks};
  }
  return null;
}

//play next
const playNextTrack = ()=>{
  const {currentTrackIndex = -1,tracks = null} = findCurrentPlayingTrack() ?? {};
  if(currentTrackIndex >-1 && currentTrackIndex < tracks?.length-1){
    playTrack(null,tracks[currentTrackIndex + 1]);
  }
}


// play previous
const playPreviousTrack = ()=>{
  const {currentTrackIndex = -1,tracks = null} = findCurrentPlayingTrack() ?? {};
  if(currentTrackIndex > 0  ){
    playTrack(null,tracks[currentTrackIndex - 1]);
  }
}


//on play button click
const playTrack = (event,{image,artistNames,name,duration,previewUrl,id})=>{
 
  if(event?.stopPropagation){
    event.stopPropagation()
  }
  if(audio.src === previewUrl){
    togglePlay();
  
   }else{
  console.log(image,artistNames,name,duration,previewUrl,id);


  const nowPlayingSongImage = document.querySelector("#now-playing-image")
  const songTitle = document.querySelector("#now-playing-song")
  const artists = document.querySelector("#now-playing-song")
  
  const audioControl = document.querySelector("#audio-control")
  const songInfo = document.querySelector("#song-info");

  audioControl.setAttribute("data-track-id",id);
  nowPlayingSongImage.src = image.url;
  songTitle.textContent = name;
  artists.textContent = artistNames;
  
  audio.src = previewUrl;
 
 // playButton.addEventListener("click",()=>onPlayingPlayButtonClicked(id))
  audio.play();
    songInfo.classList.remove("invisible")
}
 

}




//load playlist tracks
const loadPlayListTracks = ({tracks})=>{
  console.log(tracks)
  let trackNumber = 1;  
  const trackSections = document.querySelector("#tracks");
  const loadedTracks = [];
  for(let trackItem of tracks.items.filter(item=>item.track.preview_url)){
   let{id,artists,name,album,duration_ms:duration,preview_url:previewUrl} = trackItem.track;
    let track = document.createElement("section")
    track.id = id
    track.className ="track p-1 items-center justify-items-start rounded-md hover:bg-light-black grid grid-cols-[50px_1fr_1fr_50px] gap-4 text-secondary"
   let image = album.images.find(img=> img.height === 64);
    
   let artistNames = Array.from(artists,artist=>artist.name).join(", ")
   
   track.innerHTML =
    `
    <p class="relative w-full flex items-center justify-center justify-self-center"><span class="track-no">${trackNumber++}</span></p>
       <section class="grid grid-cols-[auto_1fr] place-items-center gap-2">
        <img class="h-10 w-10" src="${image.url}" alt="${name}">
        <article class="flex flex-col gap-2 justify-center">
            <h2 class="text-primary song-title text-base line-clamp-1">${name}</h2>
            <p class="text-xs line-clamp-1">${artistNames}</p>
        </article>
        </section>
        <p class="text-sm">${album.name}</p>
        <p class="text-sm">${formatTime(duration)}</p>
    `
   
    track.addEventListener("click",(event)=>onTrackSelection(event,id))
    const playButton = document.createElement("button");
    playButton.id = `play-track-${id}`;
    playButton.className =`play w-full absolute left-0 text-lg invisible material-symbols-outlined`
   
    playButton.textContent = "play_arrow";
   playButton.addEventListener("click",(event)=>playTrack(event,{image,artistNames,name,duration,previewUrl,id}))
    track.querySelector("p").appendChild(playButton);
    trackSections.appendChild(track)
    loadedTracks.push({id,artistNames,name,album,duration,previewUrl,image})
  }
  
  setItemInLocalStorage(LOADED_TRACKS,loadedTracks)

}
  

//load the elements for playlist

const fillContentForPlaylist = async (playlistId)=>{
  const playlist = await fetchRequest(`${ENDPOINT.playlist}/${playlistId}`)
  console.log(playlist)
  const {name,description,images,tracks} = playlist
  const coverElement = document.querySelector("#cover-content");
 // grid grid-cols-[auto_1fr]
  coverElement.innerHTML = `
 
              <img class="object-contain h-36 w-36" src="${images[0].url}" alt="">
       <section>       
              <h2 id="playlist-name" class="text-4xl">${name}</h2>
              <p id="playlist-artist">${description}</p>
              <p id="playlist-details">${tracks.items.length}</p>
          <section>
  
  `
  const pageContent = document.querySelector("#page-content");
  pageContent.innerHTML =`
  <header id="playlist-header" class="mx-8  border-secondary border-b-[0.5px] z-10">
  <nav class="py-2">
    <ul class="grid grid-cols-[50px_1fr_1fr_50px] gap-4 text-secondary">
      <li class="justify-self-center">#</li>
      <li>Title</li>
      <li>Album</li>
      <li>Duration</li>
    </ul>
  </nav>
</header>
<section class="px-8 text-secondary mt-4" id="tracks">
</section>
`
console.log(playlist);

        loadPlayListTracks(playlist)

  console.log(playlist);

}

const onContentScroll = (event)=>{
 

    const {scrollTop} = event.target;
    const header = document.querySelector(".header");
    const coverElement = document.querySelector("#cover-content");
    const totalHeight = coverElement.offsetHeight;
    const coverOpacity = 100-(scrollTop >= totalHeight ? 100:((scrollTop/totalHeight)*100))
    //console.log(coverOpacity);
    const headerOpacity = scrollTop >= header.offsetHeight ? 100 : ((scrollTop/header.offsetHeight)*100)
   //console.log(headerOpacity)
   coverElement.style.opacity = `${coverOpacity}%`;
   header.style.background = `rgb(0 0 0 / ${headerOpacity}%)`;
   
   
    // if(scrollTop >= header.offsetHeight){
    //   header.classList.add("sticky","top-0","bg-black")
    //   header.classList.remove("bg-transparent")
    // }else{
    //   header.classList.remove("sticky","top-0","bg-black")
    //   header.classList.add("bg-transparent")
    // }
    if(history.state.type === SECTIONTYPE.PLAYLIST){
    
      const playListHeader = document.querySelector("#playlist-header");
      // if(scrollTop >=(coverElement.offsetHeight - header.offsetHeight)){
        if(coverOpacity <=35){
        playListHeader.classList.add("sticky","bg-black-secondary","px-8");
        playListHeader.classList.remove("mx-8");
        playListHeader.style.top = `${header.offsetHeight}px`;
     
      }else{
        playListHeader.classList.remove("sticky","bg-black-secondary","px-8");
        playListHeader.classList.add("mx-8");
        playListHeader.style.top =`revert`;


      }
   
    }

  
}

const loadSections = (sections)=>{
  if(sections.type === SECTIONTYPE.DASHBOARD){
     fillContentForDashBoard();
     loadPlayLists()
  }else if(sections.type === SECTIONTYPE.PLAYLIST){
    // const pageContent = document.querySelector("#page-content");
    // pageContent.innerHTML = "playlist to be loaded here";
    fillContentForPlaylist(sections.playlist)
  }
  document.querySelector(".content").removeEventListener("scroll",onContentScroll)
  document.querySelector(".content").addEventListener("scroll",onContentScroll)
  
}



const loadPlayLists = ()=>{

  loadPlayList(ENDPOINT.featuredPlaylist,"featured-playlist-items");

  loadPlayList(ENDPOINT.toplists,"top-playlist-items");
}


document.addEventListener("DOMContentLoaded", () => {
 
 
 
  

  const volume = document.querySelector("#volume");
 
  
  const songDurationCompleted = document.querySelector("#song-duration-completed");
  const songProgress = document.querySelector("#progress");
  const timeline = document.querySelector("#timeline");
  const audioControl = document.querySelector("#audio-control");

  const next = document.querySelector("#next");
  const previous = document.querySelector("#prev")

  let progressInterval;
  
 
 
 
 
 
 
 
 
 
 
  loadUserProfile();
  const section = {type:SECTIONTYPE.DASHBOARD};
 // playlist/37i9dQZF1DWWWpLwNv0bd2

 // const section = {type:SECTIONTYPE.PLAYLIST,playlist:"37i9dQZF1DWWWpLwNv0bd2"}
 history.pushState(section,"","")
 //history.pushState(section,"",`/dashboard/playlist/${section.playlist}`)

  loadSections(section)
  //fillContentForDashBoard()
  //loadPlayLists();

  document.addEventListener("click", () => {
    const profileMenu = document.querySelector("#profile-menu");
    if (!profileMenu.classList.contains("hidden")) {
      profileMenu.classList.add("hidden");
    }
  });




audio.addEventListener("play",()=>{
 // progressInterval = setInterval //14.29
const selectedTrackId = audioControl.getAttribute("data-track-id")

const tracks = document.querySelector("#tracks");
const playingTrack= tracks?.querySelector("section.playing");
const selectedTrack = tracks?.querySelector(`[id="${selectedTrackId}"]`)
if(playingTrack?.id !== selectedTrack){
  playingTrack?.classList.remove("playing");
}
selectedTrack?.classList.add("playing");

  progressInterval =  setInterval(()=>{
      if(audio.paused){
        return
      }
      // songDurationCompleted.textContent = formatTime(audio.duration);
      songDurationCompleted.textContent = `${audio.currentTime.toFixed(0)<10 ? "0:0" + audio.currentTime.toFixed(0) : audio.currentTime.toFixed(0)}`;
      songProgress.style.width = `${(audio.currentTime/audio.duration)*100}%`;
  },100)

  updateIconsForPlayMode(selectedTrackId)
})




audio.addEventListener("pause",()=>{
  if(progressInterval){
    clearInterval(progressInterval)
  }
  const selectedTrackId = audioControl.getAttribute("data-track-id");
  updateiconsForPauseMode(selectedTrackId)
})


  
  audio.addEventListener("loadedmetadata",onAudioMetaDataLoaded);
  playButton.addEventListener("click",togglePlay)




  volume.addEventListener("change" ,()=>{
    audio.volume = volume.value / 100;
  })




  timeline.addEventListener("click",(e)=>{

    const timelineWidth = window.getComputedStyle(timeline).width;
    const timeToSeek = (e.offsetX / parseInt(timelineWidth)) * audio.duration;
    audio.currentTime = timeToSeek;
    songProgress.style.width = `${(audio.currentTime/audio.duration)*100}%`;
  },false)

  next.addEventListener("click",playNextTrack)
  previous.addEventListener("click",playPreviousTrack)

  window.addEventListener("popstate",(event)=>{
    console.log(event)
    loadSections(event.state)
  })

});


