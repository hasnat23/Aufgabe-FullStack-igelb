# Website Change Monitor

A Proof of Concept web application that monitors websites for content changes and uses AI to describe those changes.

## Overview

This project demonstrates:
- **Website Monitoring**: Add URLs to monitor and trigger manual crawls
- **Change Detection**: Automatic comparison of page content between crawls
- **AI-Powered Analysis**: LLM integration for intelligent change descriptions
- **Full-Stack Architecture**: React + TypeScript frontend, Express.js backend, Docker deployment

## Tech Stack

### Frontend
- **React 18** + **TypeScript** for type-safe UI development
- **Vite** for fast bundling and hot module replacement
- **Tailwind CSS** for responsive styling
- **Lucide React** for modern icons
- **Axios** for HTTP client with timeout handling
- **Vitest** + **React Testing Library** for component testing

### Backend
- **Express.js** for REST API server
- **TypeScript** for type safety
- **Axios** with error handling for HTTP requests
- **JSON file storage** for simplicity (scalable to database)
- **UUID** for unique identifiers

### DevOps
- **Docker** + **Docker Compose** for containerized deployment
- Single command to run entire stack: `docker-compose up`

## Architecture Decisions

### 1. File-Based Storage
- **Decision**: JSON files instead of a database
- **Rationale**: PoC simplicity, zero external dependencies, easy to inspect data
- **Trade-offs**: Not scalable for production, no concurrent write protection
- **Production Alternative**: PostgreSQL or MongoDB with proper migrations

### 2. Simple Text Comparison for LLM
- **Decision**: Fallback to hash-based comparison instead of real API calls
- **Rationale**: Avoids dependency on API keys/credentials in submission; demonstrates architecture
- **Real Implementation**: Would integrate OpenAI, Anthropic, or Ollama APIs with proper error handling
- **Integration Example**:
  ```typescript
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are a change detection expert..." },
      { role: "user", content: `Previous:\n${prev}\n\nCurrent:\n${current}` }
    ]
  })
  ```

### 3. Timeout & Error Handling Strategy
- **HTTP Timeouts**: 10s for normal requests, 30s for crawls (configurable)
- **Network Errors**: Graceful error messages, no silent failures
- **API Unavailability**: Fallback mechanisms, structured error responses
- **Type-Safe Errors**: Custom `APIError` class with status codes and context

### 4. Component Architecture
- **Separation of Concerns**: API client, components, types isolated
- **Reusable Components**: `AddWebsiteForm`, `WebsiteItem`, `ErrorAlert`
- **State Management**: React hooks (`useState`, `useEffect`) for simplicity
- **Testing**: Unit tests for form validation, API error handling

## Features

### Core Functionality
1. ✅ **URL Management**: Add, list, and delete websites
2. ✅ **Manual Crawling**: Trigger content extraction on demand
3. ✅ **Change Detection**: Compare crawls and highlight differences
4. ✅ **Change History**: View all previous detections
5. ✅ **Responsive UI**: Works on desktop and mobile

### Quality Attributes
- ✅ **Error Handling**: Timeout protection, API error messages, validation
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Testing**: Component & API client tests with mocking
- ✅ **Documentation**: This README + inline code comments

## Getting Started

### Prerequisites
- Docker & Docker Compose installed
- OR Node.js 20+

### Quick Start (Recommended)

```bash
# Clone repo (or extract files)
cd website-change-monitor

# Start entire stack
docker-compose up
```

Then open **http://localhost:3000** in your browser.

### Manual Setup (Without Docker)

#### Frontend
```bash
npm install
npm run dev
# Opens http://localhost:3000
```

#### Backend (in separate terminal)
```bash
npm install
npm run server
# Listens on http://localhost:5000
```

## Usage

1. **Add a Website**: Enter name and URL (e.g., https://example.com)
2. **Trigger Crawl**: Click refresh icon to fetch current content
3. **View Changes**: Click "View History" to see detected changes
4. **Delete Site**: Click trash icon to remove from monitoring

### Example Websites to Monitor
- https://example.com
- https://news.ycombinator.com (changes frequently)
- https://github.com (static but works for testing)
- https://weather.com (dynamic content)

## Testing

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run specific test file
npm run test -- AddWebsiteForm.test.tsx
```

### Test Coverage

1. **AddWebsiteForm Component** (`src/test/AddWebsiteForm.test.tsx`)
   - URL validation (rejects invalid formats)
   - Form submission with valid data
   - Error display on submission failure
   - Field clearing after successful submission

2. **API Client** (`src/test/api.test.ts`)
   - Successful fetch/create/crawl operations
   - HTTP error handling (500, 400 status codes)
   - Network timeout handling
   - Proper error message propagation

## API Endpoints

### Websites
- `GET /websites` - List all monitored websites
- `POST /websites` - Add new website
- `DELETE /websites/:id` - Remove website

### Crawling & Changes
- `POST /crawl/:websiteId` - Trigger content crawl
- `GET /changes/:websiteId` - Get change history

### Health
- `GET /health` - Server health check

## Error Handling

### Frontend Error Scenarios
| Error | Handling |
|-------|----------|
| Invalid URL format | Client-side validation with user message |
| Network timeout (10s) | APIError with timeout context |
| Server 500 | Display error message, don't break UI |
| Missing website | 404 with friendly error |

### Backend Error Scenarios
| Error | Handling |
|-------|----------|
| Crawl timeout (unreachable server) | 500 with timeout message after 10s |
| LLM API unavailable | Fallback to text comparison |
| Invalid JSON in storage | Reinitialize file, no data loss |
| Concurrent writes | Queue-based approach (future improvement) |

## AI Tool Usage

### How I Used KI-Tools in This Development

#### 1. **Code Generation & Architecture**
- Used to scaffold React component structure and TypeScript types
- Generated error handling patterns and API client boilerplate
- Provided Docker configuration templates

#### 2. **Testing & Validation**
- Generated test cases for component logic and edge cases
- Created mock setup for API testing with Vitest
- Validated error scenarios in form handling

#### 3. **Documentation**
- Structured this README with architecture decisions
- Generated API endpoint documentation
- Created test descriptions and usage examples

#### 4. **Problem-Solving**
- Debugged timeout handling in Axios
- Optimized component re-renders with proper `useEffect` dependencies
- Structured error classes for better type safety

### Recommendations for AI Integration (Production)
```typescript
// Example: Would use this in production
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

async function analyzeChanges(prev: string, current: string) {
  try {
    const response = await client.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `Analyze these webpage changes:\n\nBefore:\n${prev}\n\nAfter:\n${current}`
      }],
      timeout: 15000 // Built-in timeout
    })
    return response.content[0].type === 'text' ? response.content[0].text : ''
  } catch (error) {
    if (error instanceof Error && error.message.includes('timeout')) {
      return 'LLM request timed out - using fallback comparison'
    }
    throw error
  }
}
```

## Directory Structure

```
website-change-monitor/
├── src/
│   ├── components/          # React components
│   ├── api/                 # API client with error handling
│   ├── types/               # TypeScript interfaces
│   ├── test/                # Vitest test files
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── server/
│   └── index.ts             # Express backend
├── public/
│   └── index.html           # HTML template
├── docker-compose.yml       # Multi-container orchestration
├── Dockerfile.frontend      # Frontend image
├── Dockerfile.backend       # Backend image
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite bundler config
├── vitest.config.ts         # Test runner config
└── README.md                # This file
```

## Performance Optimizations

- **Frontend**: Vite with tree-shaking, lazy component loading
- **Backend**: Content size limited to 50KB to prevent memory issues
- **Crawling**: Parallel requests with timeout protection
- **Storage**: Efficient JSON serialization

## Known Limitations & Future Improvements

### Current PoC Limitations
1. Single-process backend (no concurrency)
2. No authentication/authorization
3. No rate limiting on API endpoints
4. Limited content extraction (simple HTML tag stripping)
5. No scheduled crawling (manual trigger only)

### Planned Enhancements
1. **Database Migration**: Move to PostgreSQL
2. **Real LLM Integration**: OpenAI/Anthropic API with fallbacks
3. **Scheduled Tasks**: Bull queue for automatic crawls
4. **Caching**: Redis for performance
5. **Auth**: JWT-based user sessions
6. **Advanced Diffing**: Side-by-side change visualization
7. **Alerts**: Email/Slack notifications on changes

## Deployment

### Production Checklist
- [ ] Switch to PostgreSQL
- [ ] Configure environment variables (API keys, timeouts)
- [ ] Add API rate limiting
- [ ] Enable HTTPS/SSL
- [ ] Setup CI/CD pipeline
- [ ] Add monitoring and logging
- [ ] Implement database backups
- [ ] Setup health checks

### Heroku Deployment Example
```bash
heroku create my-monitor
heroku addons:create heroku-postgresql:standard-0
git push heroku main
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Docker Build Issues
```bash
docker-compose build --no-cache
docker-compose up
```

### Backend Not Responding
```bash
# Check container logs
docker-compose logs backend

# Verify health
curl http://localhost:5000/health
```

## Contributing

1. Create a feature branch
2. Make changes with tests
3. Run `npm run test` to verify
4. Commit with clear messages
5. Push and create a pull request

## License

MIT - Feel free to use for learning and projects

## Contact & Support

- **Repository**: https://github.com/hasnat23/Aufgabe-Frontend-igelb
- **Issues**: GitHub Issues

---

**Last Updated**: 2024
**Status**: Proof of Concept
**Time Investment**: 4-6 hours
