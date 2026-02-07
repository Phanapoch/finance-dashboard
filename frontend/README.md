# Finance Dashboard Frontend

A modern, responsive finance dashboard built with React, Vite, Tailwind CSS, and Recharts.

## Features

- **Dashboard Overview**: Summary cards showing total balance, income, spending, and transactions
- **Category Breakdown**: Visual representation of spending by category
- **Spending Trends**: Line chart showing spending patterns over time
- **Transaction Management**: Interactive table with sorting and filtering capabilities

## Tech Stack

- **React 18**: UI library
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Chart library for data visualization
- **Lucide React**: Icon library
- **Axios**: HTTP client for API communication

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

### Development

Run the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

### Build

Create a production build:
```bash
npm run build
```

### Preview

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
frontend/
├── public/           # Static assets
├── src/
│   ├── components/   # Reusable React components
│   │   ├── CategoryBreakdown.jsx
│   │   ├── CategoryPieChart.jsx
│   │   ├── DashboardLayout.jsx
│   │   ├── SpendingTrend.jsx
│   │   ├── SummaryCards.jsx
│   │   └── TransactionsTable.jsx
│   ├── pages/        # Page components (if any)
│   ├── App.jsx       # Main application component
│   ├── main.jsx      # Application entry point
│   └── index.css     # Global styles and Tailwind directives
├── index.html        # HTML template
├── package.json      # Project dependencies
├── tailwind.config.js # Tailwind CSS configuration
├── vite.config.js    # Vite configuration
└── nginx.conf        # Nginx configuration for Docker
```

## Components

### DashboardLayout
The main layout wrapper with navigation and content area.

### SummaryCards
Displays key financial metrics including balance, income, spending, and transaction count.

### CategoryBreakdown
Shows spending distribution across different categories with a visual pie chart.

### SpendingTrend
Displays spending trends over time using a line chart.

### TransactionsTable
Displays transaction history with sorting, filtering, and pagination capabilities.

## Configuration

### Environment Variables

The application uses Vite proxy for API calls. Ensure the backend is running at http://localhost:8000.

### API Integration

To connect the frontend to the backend API:
1. Install axios: `npm install axios`
2. Create an API service file
3. Use axios to make requests to the backend endpoints

## Styling

The project uses Tailwind CSS with custom theme configuration. The theme is defined in `src/index.css` and includes:
- Primary colors (blue/slate)
- Secondary colors
- Muted colors for inactive states
- Card and border colors
- Border radius utilities

## Deployment

The frontend is configured for Docker deployment with Nginx as a reverse proxy. See the main project README for deployment instructions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

Proprietary - All rights reserved