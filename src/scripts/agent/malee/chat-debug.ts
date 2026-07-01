import { ChatRenderer } from "./chat-renderer";
import { maleeStore } from "./store";

export function initDebugPanel() {
  const toggleBtn = document.getElementById('debug-toggle-btn');
  const menu = document.getElementById('malee-debug-menu');
  const actionBtns = document.querySelectorAll('.debug-action-btn');
  const root = document.getElementById("malee-chat-root");

  if (!toggleBtn || !menu || !root) return;

  let tempRenderer = new ChatRenderer(root, maleeStore);

  toggleBtn.addEventListener('click', () => {
    menu.classList.toggle('open');
  });

  actionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = (e.target as HTMLElement).dataset.action;
      if (!action) return;
      
      // We re-initialize just in case DOM changed
      tempRenderer = new ChatRenderer(root, maleeStore);
      
      switch(action) {
        case 'product_carousel':
          tempRenderer.handleEvent({
            type: "product_carousel",
            title: "Recommended for you",
            subtitle: "Our best sellers",
            items: [
              { id: "1", name: "Classic Red Roses", price_lkr: 8500, image_url: "https://images.unsplash.com/photo-1591886884674-67204f141416?q=80&w=800&auto=format&fit=crop", in_stock: true },
              { id: "2", name: "Pink Elegance", price_lkr: 6200, image_url: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=800&auto=format&fit=crop", in_stock: true },
              { id: "3", name: "Sunshine Mix", price_lkr: 4800, image_url: "https://images.unsplash.com/photo-1490750967868-88cb4eca8929?q=80&w=800&auto=format&fit=crop", in_stock: false }
            ]
          });
          break;
          
        case 'product_detail':
          tempRenderer.handleEvent({
            type: "product_detail",
            item: {
              id: "p1", name: "Luxury Orchid Arrangement", description: "A stunning collection of premium orchids presented in a ceramic vase.",
              price_lkr: 12500, image_urls: [], in_stock: true, is_perishable: true, vendor_name: "Lassana Flora"
            }
          });
          break;
          
        case 'category_grid':
          tempRenderer.handleEvent({
            type: "category_grid",
            categories: ["Anniversary", "Birthday", "Sympathy", "Get Well Soon", "Congratulations"]
          });
          break;
          
        case 'city_suggestions':
          tempRenderer.handleEvent({
            type: "city_suggestions",
            cities: ["Colombo", "Kandy", "Galle", "Negombo", "Gampaha"]
          });
          break;
          
        case 'delivery_quote':
          tempRenderer.handleEvent({
            type: "delivery_quote",
            city: "Colombo 03", date: "2026-10-15", rate_lkr: 450, deliverable: true, perishable_warning: true, next_available_date: null
          });
          break;
          
        case 'checkout_form':
          tempRenderer.handleEvent({
            type: "checkout_form",
            draft: { recipient_name: "Kamal Perera", delivery_city: "Colombo", delivery_date: null, sender_name: null, gift_message: "Happy Birthday!" },
            missing_fields: ["delivery_date", "sender_name"]
          });
          break;
          
        case 'checkout_progress':
          tempRenderer.handleEvent({
            type: "checkout_progress",
            current_step: 2, total_steps: 4, step_name: "Delivery Details", missing_fields: ["delivery_date"]
          });
          break;
          
        case 'question_prompt':
          tempRenderer.handleEvent({
            type: "question_prompt",
            questions: [
              { field: "recipient", label: "Who is receiving this?", input_type: "text", placeholder: "e.g. Nimal Fernando" },
              { field: "phone", label: "Recipient's Phone Number", input_type: "tel", placeholder: "077xxxxxxx" }
            ]
          });
          break;
          
        case 'checkout_ready':
          tempRenderer.handleEvent({
            type: "checkout_ready",
            pay_url: "#", order_ref: "ORD-987654", expires_in_minutes: 15,
            cart_summary: [
              { product_id: "1", name: "Red Roses", price_lkr: 8500, quantity: 1, image_url: null },
              { product_id: "2", name: "Chocolate Box", price_lkr: 2000, quantity: 2, image_url: null }
            ]
          });
          break;
          
        case 'tracking_result':
          tempRenderer.handleEvent({
            type: "tracking_result",
            status: "Out for Delivery", recipient: "Kamal Perera", items: ["Red Roses", "Chocolate Box"],
            timeline: [
              { timestamp: new Date().toISOString(), description: "Driver is 10 mins away." },
              { timestamp: new Date(Date.now() - 3600000).toISOString(), description: "Order picked up by courier." },
              { timestamp: new Date(Date.now() - 7200000).toISOString(), description: "Arrangement prepared." }
            ]
          });
          break;
          
        case 'clear_chat':
          const messagesArea = root.querySelector('.messages-area');
          if (messagesArea) messagesArea.innerHTML = '';
          break;
      }
      
      menu.classList.remove('open');
    });
  });
}
