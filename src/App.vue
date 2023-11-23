<script setup lang="ts">
import { ref } from 'vue'
import { ipcRenderer } from 'electron'
import { version } from '../package.json'

import UIDropdownItem from './components/ui/DropdownItem.vue'

const resizable = ref('16em')
</script>

<template>
  <header class="title">
    <div class="bar d-flex position-relative align-items-stretch">
      <a class="menu d-center-flex" @click.prevent="ipcRenderer.invoke('APP-OPEN-MENU')">
        <div class="logo-menu" />
      </a>
      <div class="logo d-flex align-items-center justify-content-center flex-fill">
        <img src="./assets/logo.svg" height="22" width="22" alt="Infar Hades" />
        <span class="text">Infra.Hades</span>
      </div>
      <UIDropdownItem>
        <template #button>
          <fa icon="fa-solid fa-circle-user" />
        </template>

        <template #default>
          <li>
            <a href="#"><fa icon="fa-brands fa-github" /><span>Sign-In</span></a>
          </li>
          <li><hr class="dropdown-divider" /></li>
          <li><a href="#">Options</a></li>
          <li><a href="#demo-modal">About</a></li>
        </template>
      </UIDropdownItem>
      <div class="empty d-flex" style="width: 122px"></div>
    </div>
  </header>
  <div class="panel d-grid">
    <aside class="pane pane1">
      <div id="demo-modal" class="modal">
        <div class="content">
          <div class="d-flex flex-column align-items-center justify-content-center">
            <a href="https://github.com/touno-io/Infra-hades-app"></a>
            <img src="./assets/logo-text.svg" width="200" height="73" alt="logo" />
            <span>Version v{{ version }}</span>
            <p>
              Developed and maintanance by
              <a href="https://touno.io/s/w9z5?l=app,infar.hades" target="_blank">dvgamerr</a>
            </p>
          </div>
          <div class="footer">
            <a class="btn icon github" href="https://touno.io/s/l7cq?l=app,infar.hades" target="_blank">
              <fa icon="fa-brands fa-square-github" />
            </a>
            <a class="btn sponsor" href="https://touno.io/s/lti5?l=app,infar.hades" target="_blank">
              <fa icon="fa-regular fa-heart" style="color: #db61a2" /> Sponsor
            </a>
          </div>
          <a href="#" class="close">&times;</a>
        </div>
      </div>
    </aside>
    <section class="resizer" role="presentation" />
    <section class="pane pane2 container-fluid">
      <RouterView />
    </section>
  </div>
</template>

<style lang="scss">
.modal {
  z-index: 2;
  visibility: hidden;
  opacity: 0;
  position: absolute;
  inset: 31px 0 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(12 12 12 / 25%);
  transition: all 0.2s;

  &:target {
    visibility: visible;
    opacity: 1;
  }

  > .content {
    color: var(--user-text-color);
    border-radius: 4px;
    background-color: var(--user-background-color);
    border: #363636 solid 1px;
    box-shadow: 0 0.2em 0.6em #00000054;
    position: relative;
    width: 400px;
    max-width: 90%;
    padding: 1em 2em;

    h3 {
      margin-top: 0;
    }

    a {
      text-decoration: none;
      color: #00a91dfa;

      &:hover {
        text-decoration: underline;
      }
    }

    i {
      color: #d02d2c;
    }

    > .footer {
      display: flex;
      justify-content: flex-end;

      > .btn {
        font-size: 0.7rem;
        text-decoration: none !important;
        border: transparent solid 1px;
        padding: 5px 8px;
        transition: 0.1s ease-out;
        border-radius: 2px;
        margin: 0 2px;

        &.icon {
          border-color: transparent !important;
          padding: 0;
        }

        &:hover {
          border-color: #2e2e2e;
        }

        &:active {
          border-color: #272727;
        }

        svg {
          font-size: 0.9rem;
        }

        &.github {
          color: #fff;
          font-size: 1.6rem;
          display: flex;
          align-items: center;
          svg {
            font-size: 1.4rem;
          }
        }

        &.sponsor {
          color: #fff;
          display: flex;
          align-items: center;
          gap: 3px;

          svg {
            font-size: 1rem;
          }
        }
      }
    }

    > .close {
      position: absolute;
      inset: 7px 12px auto auto;
      color: #585858;
      text-decoration: none !important;
    }
  }
}

#app {
  > .title {
    grid-area: title;
    user-select: none;

    .bar {
      -webkit-app-region: drag;
      gap: 4px;
      margin: -8px 0 0 -8px;
      width: 100%;
      height: 31px;

      > .logo > .text {
        font-size: 0.75rem;
        font-family: Mulish;
        font-weight: 700;
      }

      > a {
        -webkit-app-region: no-drag !important;
        border: none;

        *,
        ::after,
        ::before {
          animation: none !important;
        }

        &.menu {
          width: 45px;
          cursor: default;

          &:hover {
            background-color: #ffffff1f;
          }
        }

        > .logo-menu {
          margin-right: 1em;
          transform: scale(0.16) translateX(40px) translateY(-20px);
        }

        &.profile {
          font-size: 0.94rem;
          width: 2.4em;
        }
      }
    }
  }

  > .panel {
    margin: -8px;
    grid-area: panel;
    flex: 1 1 0%;
    height: calc(100% + 16px);
    outline: none;
    overflow: hidden;
    flex-direction: row;
    grid-template-columns: v-bind(resizable) 4px 1fr;
    justify-items: stretch;
    align-items: stretch;
    grid-template-areas: 'pane1 resizer pane2';

    .resizer {
      cursor: col-resize;
    }

    .resizer:active {
      background-color: rgb(255 255 255 / 5%);
    }

    .pane {
      padding: 10px;
    }
  }
}
</style>
