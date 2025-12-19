document.addEventListener("DOMContentLoaded", function () {
  // Sidebar toggle
  const sidebar = document.getElementById("sidebar");
  const toggler = document.querySelector(".navbar-toggler");
  const closeBtn = document.getElementById("close");

  toggler?.addEventListener("click", () => {
    sidebar.classList.toggle("show");
  });

  closeBtn?.addEventListener("click", () => {
    sidebar.classList.remove("show");
  });
});

// active class
document.querySelectorAll(".sidebar li").forEach((li) => {
  li.addEventListener("click", () => {
    document
      .querySelectorAll(".sidebar li")
      .forEach((item) => item.classList.remove("active"));
    li.classList.add("active");
  });
});
