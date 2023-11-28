<script>
  import icons from '../assets/logo.svg'
  // const versions = window.Electron.process.versions
  let count = 0
  function incrementCount() {
    //incremtent
    count++
    console.log('count:', count)
  }
</script>

<div class="title">
  <div class="bar">
    <button class="menu" on:click={incrementCount}>
      <div class="api-ico preload-ico idle" />
    </button>
    <div class="logo">
      <img src={icons} height="22" width="22" alt="Infar Hades" />
      <span class="text">Infra.Hades</span>
    </div>
    <div class="empty d-flex" style="width: 122px"></div>
  </div>
</div>

<!-- <ul class="versions">
  <li class="electron-version">Electron v{versions.electron}</li>
  <li class="chrome-version">Chromium v{versions.chrome}</li>
  <li class="node-version">Node v{versions.node}</li>
  <li class="v8-version">V8 v{versions.v8}</li>
</ul> -->

<style lang="scss">
  .title {
    user-select: none;
    grid-area: title;

    > .bar {
      -webkit-app-region: drag;
      display: flex;
      align-items: center;
      position: absolute;
      gap: 0.25em;
      margin: -8px 0 0 -8px;
      width: 100%;
      height: var(--system-titleBar-height);

      > .logo {
        display: flex;
        align-items: center;
        gap: 0.25em;
        flex: 1;

        > .text {
          font-size: 0.75rem;
          font-family: 'Mulish';
          font-weight: 700;
        }
      }

      > button {
        background-color: transparent;
        border: none;
        > .preload-ico {
          margin-right: 1em;
          transform: scale(0.16) translateX(9px) translateY(-35px);
        }

        //   border: none;
        .idle,
        .idle::before,
        .idle::after {
          animation: none !important;
        }

        *,
        ::after,
        ::before {
          animation-duration: 0.4s;
        }

        &.menu {
          -webkit-app-region: no-drag !important;
          width: 2.5em;
          cursor: pointer !important;
          height: 100%;
          &:hover {
            background-color: #ffffff1f;
          }
        }

        //   &.profile {
        //     font-size: 0.94rem;
        //     width: 2.4em;
        //   }
      }
    }
  }

  // > .panel {
  //   margin: -8px;
  //   grid-area: panel;
  //   flex: 1 1 0%;
  //   height: calc(100% + 16px);
  //   outline: none;
  //   overflow: hidden;
  //   flex-direction: row;
  //   grid-template-columns: v-bind(resizable) 4px 1fr;
  //   justify-items: stretch;
  //   align-items: stretch;
  //   grid-template-areas: 'pane1 resizer pane2';

  //   .resizer {
  //     cursor: col-resize;
  //   }

  //   .resizer:active {
  //     background-color: rgb(255 255 255 / 5%);
  //   }

  //   .pane {
  //     padding: 10px;
  //   }
  // }
</style>
