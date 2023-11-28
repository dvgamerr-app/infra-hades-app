<script>
  import { Router, Route, navigate } from 'svelte-routing'
  import TitleBar from './components/TitleBar.svelte'

  // Routes
  import Home from './routes/Home.svelte'
  import Context from './routes/cluster/Contexts.svelte'

  navigate('/context', { replace: true })
</script>

<TitleBar />
<div id="desktop">
  <Router>
    <Route path="/" component={Home}></Route>
    <Route path="/context" component={Context}></Route>
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
