// -----------------------------
//  THREE.JS VIEWER
// -----------------------------
let scene = new THREE.Scene();
scene.background = new THREE.Color(0x333333); 
let camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
let renderer = new THREE.WebGLRenderer({ antialias: true });

let viewer = document.getElementById("viewer3d");
camera.aspect = viewer.clientWidth / viewer.clientHeight;
camera.updateProjectionMatrix();
renderer.setSize(viewer.clientWidth, viewer.clientHeight);
viewer.appendChild(renderer.domElement);

camera.position.set(100, 100, 150);

let controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

let model;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); 
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

const gridHelper = new THREE.GridHelper(100, 10, 0x00ff00, 0x444444);
scene.add(gridHelper);

function renderLoop() {
    requestAnimationFrame(renderLoop);
    controls.update();
    renderer.render(scene, camera);
}
renderLoop();

window.addEventListener('resize', () => {
    let width = viewer.clientWidth;
    let height = viewer.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// -----------------------------
// LOAD 3D MODEL
// -----------------------------
document.getElementById("file3d").addEventListener("change", function (e) {
    let file = e.target.files[0];
    let filename = file.name.toLowerCase();
    let reader = new FileReader();

    reader.onload = function (event) {
        let geometry, material = new THREE.MeshStandardMaterial({ color: 0xAAAAAA, roughness: 0.5, metalness: 0.5 });

        if (model) scene.remove(model);

        if (filename.endsWith('.stl')) {
            const stlLoader = new THREE.STLLoader();
            geometry = stlLoader.parse(event.target.result);
            model = new THREE.Mesh(geometry, material);
        } else if (filename.endsWith('.obj')) {
            const objLoader = new THREE.OBJLoader();
            const object = objLoader.parse(event.target.result);
            object.traverse(child => { if (child.isMesh) child.material = material; });
            model = object;
        } else {
            alert('Format non supporté. STL ou OBJ seulement.');
            return; 
        }

        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.sub(center);

        let size = new THREE.Vector3();
        box.getSize(size);
        let scaleFactor = 80 / Math.max(size.x, size.y, size.z); 
        model.scale.set(scaleFactor, scaleFactor, scaleFactor);

        scene.add(model);
        scene.add(gridHelper);
        controls.reset();
        controls.update();
    };

    filename.endsWith('.stl') ? reader.readAsArrayBuffer(file) : reader.readAsText(file);
});

// -----------------------------
// ESTIMATION LOGIC
// -----------------------------
document.getElementById("btn-estimate").addEventListener("click", function () {
    let L = parseFloat(document.getElementById("length").value) || 0;
    let W = parseFloat(document.getElementById("width").value) || 0;
    let H = parseFloat(document.getElementById("height").value) || 0;
    
    if (L <= 0 || W <= 0 || H <= 0) {
        alert("Veuillez saisir des dimensions valides (L, W, H en mm).");
        document.getElementById("estimate-box").style.display = "none";
        document.getElementById("btn-send").disabled = true;
        return;
    }

    let materialRate = parseFloat(document.getElementById("material").value);
    let volume = L * W * H;
    let weight = volume / 1000;
    let printingTime = (weight / 15).toFixed(1);
    let price = weight * materialRate;

    document.getElementById("est-weight").textContent = weight.toFixed(2) + " g";
    document.getElementById("est-price").textContent = price.toFixed(3) + " dt";
    document.getElementById("est-time").textContent = printingTime + " h";

    document.getElementById("estimate-box").style.display = "block";
    document.getElementById("btn-send").disabled = false;
});

// -----------------------------
// FORM SUBMIT & SUCCESS MESSAGE
// -----------------------------
document.getElementById("quote-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const status = document.getElementById("quote-status");
    status.textContent = "";
    status.style.color = "";

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const material = document.getElementById("material").options[document.getElementById("material").selectedIndex].text;
    const length = document.getElementById("length").value;
    const width = document.getElementById("width").value;
    const height = document.getElementById("height").value;
    const details = document.getElementById("details")?.value || "";
    const fileInput = document.getElementById("file3d");
    const fileName = fileInput.files[0]?.name || "Aucun fichier";

    const weight = document.getElementById("est-weight").textContent;
    const price = document.getElementById("est-price").textContent;
    const time = document.getElementById("est-time").textContent;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("Material", material);
    formData.append("Dimensions", `L:${length} x W:${width} x H:${height} mm`);
    formData.append("Details", details);
    formData.append("File", fileName);
    formData.append("Estimated Weight", weight);
    formData.append("Estimated Price", price);
    formData.append("Estimated Time", time);

    try {
        const response = await fetch("https://formspree.io/f/mvgerern", {
            method: "POST",
            body: formData,
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            status.textContent = "🔸 Votre devis a été envoyé !";
            status.style.color = "green";

            // Laisser le message affiché 5 secondes avant de reset
            setTimeout(() => {
                // reset form et UI
                document.getElementById("quote-form").reset();
                document.getElementById("btn-send").disabled = true;
                document.getElementById("estimate-box").style.display = "none";

                // retirer modèle 3D
                if (model) {
                    scene.remove(model);
                    model = null;
                }

                // effacer le message après reset
                status.textContent = "";
            }, 5000); // 5000 ms = 5 secondes


        } else {
            status.textContent = "❌ Problème lors de l'envoi du devis.";
            status.style.color = "red";
        }
    } catch (error) {
        status.textContent = "⚠️ Erreur réseau. Veuillez réessayer.";
        status.style.color = "orange";
    }
});
