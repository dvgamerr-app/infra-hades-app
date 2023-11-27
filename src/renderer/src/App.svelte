<script>
  import { Router, Link, Route } from 'svelte-routing'
  import TitleBar from './components/TitleBar.svelte'

  // Routes
  import Home from './routes/Home.svelte'
</script>

<TitleBar />
<div id="desktop">
  <Router>
    <nav>
      <Link to="/">Home</Link>
      <Link to="/asd">asd</Link>
    </nav>
    <div>
      <Route path="/" component={Home}></Route>
    </div>
  </Router>
</div>

<style>
  #desktop {
    grid-area: panel;
    overflow: auto;
    /* overflow: hidden; */
    /* flex-direction: row; */
    /* grid-template-columns: v-bind(resizable) 4px 1fr;
    justify-items: stretch; */
    /*
    .resizer {
      cursor: col-resize;
    }

    .resizer:active {
      background-color: rgb(255 255 255 / 5%);
    }

    .pane {
      padding: 10px;
    } */
  }
</style>
