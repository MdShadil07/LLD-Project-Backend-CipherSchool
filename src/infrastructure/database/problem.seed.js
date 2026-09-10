import { Problem } from '../../models/problem.model.js';

const sharedRubric = [
  ['Requirement Understanding', 15, 'Important requirements and assumptions are identified and addressed.'],
  ['Responsibilities', 20, 'Behavior is owned by cohesive objects without overloaded classes.'],
  ['Encapsulation & Interfaces', 10, 'State and behavior are protected behind useful boundaries.'],
  ['Relationships & Coupling', 10, 'Dependencies are understandable and unnecessary coupling is avoided.'],
  ['Extensibility', 15, 'Reasonable requirement changes can be accommodated cleanly.'],
  ['Core Flow', 10, 'The primary use case has coherent interactions and state changes.'],
  ['Edge Cases', 10, 'Important failures and boundary cases are considered.'],
  ['Reasoning & Trade-offs', 10, 'Design choices and alternatives are explained clearly.'],
];

const rubricIds = {
  'Requirement Understanding': 'requirement_understanding',
  Responsibilities: 'responsibilities',
  'Encapsulation & Interfaces': 'encapsulation_interfaces',
  'Relationships & Coupling': 'relationships_coupling',
  Extensibility: 'extensibility',
  'Core Flow': 'core_flow',
  'Edge Cases': 'edge_cases',
  'Reasoning & Trade-offs': 'reasoning_tradeoffs',
};

const makeRubric = (overrides = {}) =>
  sharedRubric.map(([criterion, weight, description]) => ({
    id: rubricIds[criterion],
    criterion,
    weight,
    description: overrides[criterion] ?? description,
  }));

export const problemSeed = [
  {
    slug: 'parking-lot',
    title: 'Parking Lot',
    difficulty: 'BEGINNER',
    estimatedTime: 45,
    description:
      'A parking lot system manages the entry, placement, and exit of vehicles across multiple floors and spot types. ' +
      'The core challenge is not just storing cars — it is modeling the right abstractions: a ParkingLot that delegates to Floors, ' +
      'Floors that manage ParkingSpots, and Spots that understand which vehicle types they accept. ' +
      'You must design a ticketing system that records entry time and spot information, and a fee calculator that applies different ' +
      'pricing strategies (hourly, flat-rate, vehicle-type-based). ' +
      'A good design separates spot allocation logic from payment logic, keeps vehicle-type handling extensible via polymorphism or strategy, ' +
      'and avoids coupling the ParkingLot class with low-level details. ' +
      'The parking lot is a foundational LLD problem that tests your ability to assign responsibilities cleanly and design for change.',
    requirements: [
      'The parking lot has multiple floors.',
      'Each floor has multiple parking spots of varying sizes (compact, large, motorcycle).',
      'Support cars, bikes, trucks, and other vehicle types.',
      'Park a vehicle in the nearest appropriate spot based on its type and size.',
      'Generate a ticket when a vehicle is parked, recording entry time and spot details.',
      'Calculate and collect parking fees when the vehicle exits.',
      'Show a full-lot message when no spots are available for a vehicle type.',
      'Allow an attendant to view current occupancy per floor.',
    ],
    nonFunctionalRequirements: [
      'Spot allocation should be efficient and not require scanning all floors each time.',
      'The design should be extensible for new vehicle types and pricing rules without modifying existing classes.',
      'The system should remain maintainable and thread-safe under concurrent vehicle entry.',
    ],
    topics: ['OOP', 'Responsibilities', 'Strategy', 'Extensibility'],
    beforeYouStart: 'Start by mapping out the physical entities: Floors, Spots, and Vehicles. Think about how a vehicle finds an empty spot efficiently—you shouldn\'t need to iterate over all floors every time a car enters. Pay special attention to where the pricing strategy lives.',
    rubric: makeRubric(),
  },
  {
    slug: 'vending-machine',
    title: 'Vending Machine',
    difficulty: 'BEGINNER',
    estimatedTime: 30,
    description:
      'A vending machine is a self-contained system that sells products, handles multiple payment methods, manages inventory, ' +
      'and enforces strict rules about what actions are valid at each point in a transaction. ' +
      'The key LLD insight is that a vending machine is a state machine: its behaviour changes completely depending on whether ' +
      'it is idle, has received money, has dispensed a product, or is awaiting change. ' +
      'A naive design puts all this logic into one bloated class full of if-else branches. ' +
      'A strong design uses the State pattern (or equivalent) so each state encapsulates only the transitions and actions ' +
      'valid within it, making the flow explicit and easy to extend. ' +
      'You also need to think about how payment processing, inventory management, and product selection interact, ' +
      'and how to make each of those independently changeable.',
    requirements: [
      'Display available products and their current prices.',
      'Accept coins and card payments.',
      'Dispense the selected product after successful payment.',
      'Return change when the inserted amount exceeds the product price.',
      'Reject selection of unavailable or out-of-stock products.',
      'Reject incomplete payments and allow the user to cancel and retrieve their money.',
      'Allow an administrator to replenish inventory and update prices.',
    ],
    nonFunctionalRequirements: [
      'State transitions should be explicit — only valid actions permitted in each state.',
      'Payment providers (coin, card, digital) should be swappable without rewriting machine logic.',
      'Inventory updates should not lose stock data under concurrent requests.',
    ],
    topics: ['State', 'Encapsulation', 'Responsibilities', 'State transitions'],
    beforeYouStart: 'Focus entirely on the State pattern. The machine behaves completely differently when it\'s waiting for money vs when it\'s dispensing an item. Map out the exact states and the valid transitions between them before writing any class logic.',
    rubric: makeRubric({
      'Responsibilities': 'Each machine state owns only the behaviour valid in that state.',
      'Extensibility': 'Payment and product strategies can change without rewriting the core workflow.',
    }),
  },
  {
    slug: 'elevator-system',
    title: 'Elevator System',
    difficulty: 'INTERMEDIATE',
    estimatedTime: 60,
    description:
      'An elevator system coordinates multiple elevator cars, floor call buttons, cabin buttons, scheduling decisions, ' +
      'and safety constraints across a multi-storey building. ' +
      'The core difficulty is separating concerns cleanly: the ElevatorController (or Dispatcher) decides which elevator ' +
      'should serve a request, the Elevator manages its own movement and door state, and the Scheduler implements ' +
      'the algorithm for assigning requests (SCAN, LOOK, nearest-car, etc.). ' +
      'A common mistake is building one God class that handles everything. ' +
      'A good design makes the scheduling algorithm swappable (so you can upgrade from a simple nearest-car to SCAN ' +
      'without touching the elevator logic), and ensures that requests are never silently dropped during transitions. ' +
      'This problem tests object collaboration, state management, and extensibility under realistic concurrency constraints.',
    requirements: [
      'Support multiple elevator cars and floors in a building.',
      'Accept external hall requests (up/down buttons on each floor) and internal cabin requests (floor buttons inside the elevator).',
      'Schedule and assign requests to the most suitable elevator using a defined strategy.',
      'Track each elevator\'s current floor, direction, and operational state (idle, moving up, moving down, doors open).',
      'Refuse to move an elevator while its doors are open.',
      'Handle overloaded or out-of-service elevators gracefully — redirect requests to other cars.',
      'Prevent an elevator from traveling past the top or bottom floor.',
    ],
    nonFunctionalRequirements: [
      'The scheduling algorithm must be swappable (e.g., nearest-car to SCAN) without modifying elevator logic.',
      'Pending requests must not be lost when an elevator changes state.',
      'The system must handle concurrent floor requests from multiple users correctly.',
    ],
    topics: ['Object collaboration', 'State', 'Scheduling', 'Extensibility'],
    beforeYouStart: 'The tricky part is decoupling the elevator\'s movement logic from the scheduling logic. The elevator should know how to move and open doors, while a separate Dispatcher or Scheduler decides which requests go to which elevator. Ensure you handle edge cases like when an elevator is overloaded or out of service.',
    rubric: makeRubric({
      'Core Flow': 'Requests move through clear scheduling, movement, and door state transitions.',
      'Edge Cases': 'Overload, maintenance mode, duplicate requests, and unavailable elevators are explicitly handled.',
    }),
  },
  {
    slug: 'library-management',
    title: 'Library Management',
    difficulty: 'ADVANCED',
    estimatedTime: 60,
    description:
      'A library management system handles a rich domain: books exist as catalogued titles with multiple physical copies, ' +
      'members have borrowing limits and overdue histories, and the system must enforce lending policies, track reservations, ' +
      'calculate fines, and notify members when reserved titles become available. ' +
      'The LLD challenge is that this domain has many interacting policies (how long can you borrow? what is the fine rate? ' +
      'how many books can one member hold?) that must be modelled as first-class objects rather than hardcoded numbers. ' +
      'A strong design separates the catalogue (what books exist) from circulation (who has what copy), ' +
      'makes fine and reservation policies independently configurable, and models the notification mechanism in a way ' +
      'that does not tightly couple the reservation system to any specific delivery method (email, SMS, in-app).',
    requirements: [
      'Search the catalogue by title, author, ISBN, and category.',
      'Register members and enforce per-member borrowing limits.',
      'Issue a specific copy of a book to a member and record the due date.',
      'Process returns, update copy availability, and trigger reservation notifications.',
      'Allow members to reserve titles that are currently checked out.',
      'Calculate overdue fines based on days late and a configurable daily rate.',
      'Notify members automatically when a copy they reserved becomes available.',
    ],
    nonFunctionalRequirements: [
      'Catalogue search must remain efficient even with tens of thousands of titles.',
      'Fine calculation and reservation policies must be replaceable through configuration, not code changes.',
      'Borrowing and return events must be auditable for reporting.',
    ],
    topics: ['Domain modeling', 'SOLID', 'Events', 'Policies'],
    beforeYouStart: 'Separate the catalogue (Book and BookItem) from the circulation logic. Modeling policies like borrowing limits and fine calculations as separate strategy objects will keep your core classes clean and extensible.',
    rubric: makeRubric(),
  },
  {
    slug: 'food-delivery',
    title: 'Food Delivery',
    difficulty: 'ADVANCED',
    estimatedTime: 75,
    description:
      'A food delivery platform orchestrates three distinct actors — customers, restaurant partners, and delivery partners — ' +
      'across a workflow that spans menu browsing, order placement, payment processing, order preparation, ' +
      'delivery assignment, and real-time status updates. ' +
      'The design challenge is that order state changes (placed → accepted → preparing → ready → picked-up → delivered) ' +
      'need to be visible to all three actors simultaneously, which calls for an event-driven or observer-based approach. ' +
      'Additionally, payment processing and delivery assignment are genuine variation points: different payment gateways ' +
      'and different assignment strategies (closest partner, highest rating) must be pluggable. ' +
      'A common mistake is building a single Order class that handles all three actor workflows. ' +
      'A good design models each actor\'s view separately and uses domain events to coordinate state without tight coupling.',
    requirements: [
      'Customers can browse restaurant menus and view item descriptions and prices.',
      'Customers can build a cart, place an order, and pay via multiple payment methods.',
      'Restaurants receive new orders and can accept or reject them.',
      'Restaurants can mark orders as prepared and ready for pickup.',
      'Delivery partners can view available assignments and accept a delivery.',
      'All actors can track order status from placement through to delivered.',
      'Handle payment failures gracefully — notify the customer and release the order.',
      'Handle delivery partner unavailability — reassign to another available partner.',
    ],
    nonFunctionalRequirements: [
      'Order state changes must be observable to all three actor types without polling.',
      'Payment gateway and delivery assignment strategy must be independently replaceable.',
      'Concurrent order updates (e.g., simultaneous status changes) must be handled safely.',
    ],
    topics: ['Observer', 'Payments', 'Async workflows', 'State'],
    beforeYouStart: 'Since this involves three different actors (customers, restaurants, drivers) needing real-time updates, strongly consider an Observer pattern or event-driven approach. Avoid tying the Order entity tightly to the notification logic.',
    rubric: makeRubric(),
  },
  {
    slug: 'movie-ticket-booking',
    title: 'Movie Ticket Booking',
    difficulty: 'INTERMEDIATE',
    estimatedTime: 60,
    description:
      'A movie ticket booking system allows users to find showtimes, view seating layouts, select seats, pay, ' +
      'and receive confirmed bookings — all while preventing two users from booking the same seat simultaneously. ' +
      'The central LLD challenge is the seat reservation flow under concurrency: seats must be temporarily locked ' +
      'while a user is in the payment flow, and those locks must expire reliably if payment does not complete. ' +
      'Without careful design, two users can see the same seat as "available", both select it, and both pay — ' +
      'resulting in a double booking. ' +
      'A good design separates the concerns of search (finding shows), locking (temporary reservation), ' +
      'booking (confirmed payment), and expiry (releasing stale locks), and makes the locking mechanism ' +
      'independent of the payment provider. ' +
      'This problem is excellent practice for concurrency control, transactional thinking, and clear state lifecycle design.',
    requirements: [
      'Search for movies, theatres, and available showtimes by date and location.',
      'Display the seating chart for a selected show with available, locked, and booked states.',
      'Temporarily lock selected seats for a user for a configurable time window (e.g. 10 minutes).',
      'Complete payment to confirm the booking and permanently reserve the seat.',
      'Automatically release seat locks when the payment window expires without payment.',
      'Release seats immediately if payment fails, making them available again.',
      'Prevent two users from completing a booking for the same seat.',
      'Allow a user to cancel a confirmed booking within a defined pre-show window.',
    ],
    nonFunctionalRequirements: [
      'Seat lock expiry must be reliable and not require manual intervention.',
      'Search across many shows and theatres must remain responsive.',
      'Booking operations must be consistent and free from data races.',
    ],
    topics: ['Concurrency', 'Locks', 'Search', 'Transactions'],
    beforeYouStart: 'Concurrency is the main challenge here. Think about how to handle multiple users trying to book the same seat at the same time. You will need a way to lock a seat temporarily, and a background mechanism to release the lock if the payment isn\'t completed in time.',
    rubric: makeRubric({
      'Edge Cases': 'Expired locks, payment failure, and concurrent seat selection are all explicitly handled.',
    }),
  },
];

export async function seedProblems() {
  for (const problem of problemSeed) {
    await Problem.updateOne({ slug: problem.slug }, { $set: problem }, { upsert: true });
  }
  console.info(`Problem catalog ready (${problemSeed.length} problems).`);
}
