// dynamix.js
// MoreScript!

import "./morescript.js";

// Dynamix Library
const dynamix = Immutable({
    console: {
        sendreq: async function (url, data, method = "GET", headers = {}, callback = console.log) {
            try {
                const options = {
                    method: method,
                    headers: { "Content-Type": "application/json", ...headers }
                };
            
                if (method !== "GET" && data) options.body = JSON.stringify(data);
            
                const response = await fetch(url, options);
                const result = await response.json();
            
                if (typeof callback === "function") callback(result);
            } catch (error) {
                console.error("Error:", error);
            }
        },
        domselect: function(selector) {
            return {
                hide: function() {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(el => el.style.display = 'none');
                },
                show: function(fade = false) {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(el => {
                        el.style.display = '';
                    });
                },
            };
        }
    },
    client: {
        db: {
            openDB: function(callback) {
                const request = indexedDB.open("DynamixDB", 1);

                // First time creating the database
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains("DynamixDB")) {
                        db.createObjectStore("DynamixDB", { keyPath: "id" });
                    }
                };
            
                request.onsuccess = (event) => {
                    const db = event.target.result;
                    callback(db);
                };
            
                request.onerror = (event) => {
                    console.error("IndexedDB error:", event.target.error);
                };
            },
            save: function (id, data) {
                dynamix.client.db.openDB((db) => {
                    const tx = db.transaction("DynamixDB", "readwrite");
                    const store = tx.objectStore("DynamixDB");
                    store.put({ id, data });
                    tx.oncomplete = () => console.log("Data saved!");
                    tx.onerror = (e) => console.error("Transaction error", e);
                });
            },
            load: function (id, callback) {
                dynamix.client.db.openDB((db) => {
                    const tx = db.transaction("DynamixDB", "readonly");
                    const store = tx.objectStore("DynamixDB");
                    const request = store.get(id);
                    request.onsuccess = () => callback(request.result?.data);
                    request.onerror = (e) => console.error("Load error", e);
                });
            }
        },
        functionablity: {
            redirect: function (url) {
                window.location.href = url;
            },
            popup: function (url, title) {
                const Window = window.open(url, title, "width=600,height=400");
                if (Window) Window.focus();
            },
            route: async function (path) {
                history.pushState({}, "", path);
                try {
                    const response = await fetch(path);
                    if (!response.ok) throw new Error("Page not found");

                    const html = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, "text/html");

                    document.body.innerHTML = doc.body.innerHTML;
                } catch (err) {
                    document.body.innerHTML = "<h1>404 - Page Not Found</h1>";
                    console.error(err);
                }
            }
        }
    },
    server: {
        websocket: function(url, onMessage, onOpen, onClose, onError) {
            const ws = new WebSocket(url);
            ws.onopen = (event) => { if(onOpen) onOpen(event); };
            ws.onmessage = (event) => { if(onMessage) onMessage(event.data); };
            ws.onclose = (event) => { if(onClose) onClose(event); };
            ws.onerror = (event) => { if(onError) onError(event); };
            return ws;
        },
        sse: function(url, onMessage, onOpen, onError) {
            const es = new EventSource(url);
            es.onopen = (event) => { if(onOpen) onOpen(event); };
            es.onmessage = (event) => { if(onMessage) onMessage(event.data); };
            es.onerror = (event) => { if(onError) onError(event); };
            return es;
        }
    },
    autoval: function(initialValue) {
        let value = initialValue;
        const listeners = new Set();

        return {
            get: () => value,
            set: (newVal) => {
                value = newVal;
                listeners.forEach(fn => fn(value));
            },
            subscribe: (fn) => {
                listeners.add(fn);
                fn(value); // run immediately
                return () => listeners.delete(fn);
            }
        };
    },
    jskit: {
        element: function(tag, attrs = {}, children = [], appendto = document.body) {
            const el = document.createElement(tag);

            // attributes
            for (let key in attrs) {
                if (key === "style") {
                    Object.assign(el.style, attrs.style);
                } else if (key.startsWith("on") && typeof attrs[key] === "function") {
                    el.addEventListener(key.slice(2).toLowerCase(), attrs[key]);
                } else {
                    el.setAttribute(key, attrs[key]);
                }
            }

            // children
            children.forEach(child => {
                if (typeof child === "string") el.appendChild(document.createTextNode(child));
                else if (child instanceof Node) el.appendChild(child);
                else if (child && child.subscribe) {
                    child.subscribe(val => {
                        el.textContent = val;
                    });
                }
            });

            appendto.appendChild(el);
            return el;
        },
        branding: function(title, iconUrl) {
            if(title) document.title = title;
        
            if(iconUrl) {
                let link = document.querySelector("link[rel~='icon']");
                if(!link) {
                    link = document.createElement('link');
                    link.rel = 'icon';
                    document.head.appendChild(link);
                }
                link.href = iconUrl;
            }
        },
        applyTheme: function(theme) {
            const themes = {
                "modern": { bg: "#3f3f4a", color: "white", btn: "#4f4f5a", hover: "#5f5f6a", active: "#2f2f3a" },
                "modern-light": { bg: "#c0c0b5", color: "white", btn: "#b0b0b5", hover: "#a0a0a5", active: "#d0d0c5" }
            };
        
            const t = themes[theme];
            if (!t) return;
        
            const currentTheme = t; // store current theme for later use
        
            // Body styles
            document.body.style.borderRadius = "11px";
            document.body.style.overflow = "hidden";
            document.body.style.backgroundColor = t.bg;
            document.body.style.color = t.color;
            document.body.style.fontFamily = "'Ubuntu', inter, 'Segoe UI', sans-serif, helvetica, serif";
        
            // Apply theme to buttons (all elements with type="button")
            const buttons = document.querySelectorAll("[type='button']");
            buttons.forEach(button => {
                button.style.borderRadius = "100%";
                button.style.backgroundColor = t.btn;
                button.style.padding = "8px";
            
                button.addEventListener("mouseenter", () => button.style.backgroundColor = t.hover);
                button.addEventListener("mouseleave", () => button.style.backgroundColor = t.btn);
                button.addEventListener("mousedown", () => button.style.backgroundColor = t.active);
                button.addEventListener("mouseup", () => button.style.backgroundColor = t.hover);
            });
        },
    }
});