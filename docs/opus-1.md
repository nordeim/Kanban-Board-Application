<think>
I need to create a comprehensive UX Structure Plan for a YouTube sponsorship workflow Kanban board application. This needs to be in a specific markdown format with box-drawing characters creating a tree structure.

Let me think about the key components:

1. Navigation Flow - I'll outline the user journey from login to managing deals
2. Login Page Structure - Need authentication elements, branding, and user-friendly design
3. Dashboard Page Structure - This is the main view with:
   - Header with navigation and user controls
   - Kanban board with 9 stages for sponsorship workflow
   - Cards with sponsorship deal information
   - Filtering and search capabilities
4. "Add New Deal" Modal - Form for creating new sponsorship deals

For the 9 stages of the Kanban board, I'll use a logical progression for YouTube sponsorship workflow:
1. New Leads - Initial sponsorship inquiries
2. Initial Contact - First communications established
3. Negotiation - Terms being discussed
4. Contract Review - Legal/terms review
5. Content Creation - Video production phase
6. Review & Approval - Sponsor reviewing content
7. Publishing - Ready to go live
8. Payment Pending - Published, awaiting payment
9. Completed - Deal closed and archived

Each section needs to be detailed with all UI elements and interactions clearly outlined in the tree structure format.
</think>

```markdown
YouTube Sponsorship Workflow - UX Structure Plan
================================================

├── 1. Navigation Flow
│   ├── Landing Page
│   │   └── Sign In CTA → Login Page
│   ├── Login Page
│   │   ├── Successful Authentication → Dashboard
│   │   └── Failed Authentication → Error State → Retry Login
│   ├── Dashboard (Main Kanban View)
│   │   ├── View All Deals
│   │   ├── Filter/Search Deals
│   │   ├── Drag & Drop Cards Between Stages
│   │   ├── Click Card → Deal Details Sidebar
│   │   ├── Add New Deal → Modal Overlay
│   │   └── Profile Menu → Account Settings/Logout
│   └── Deal Management Actions
│       ├── Create New Deal
│       ├── Edit Deal Information
│       ├── Move Deal Through Stages
│       ├── Archive Completed Deals
│       └── Delete Cancelled Deals

├── 2. Login Page Structure
│   ├── Background
│   │   └── Gradient Overlay with Animated Pattern
│   ├── Login Container
│   │   ├── Logo Section
│   │   │   ├── App Logo
│   │   │   └── App Name "SponsorFlow"
│   │   ├── Welcome Message
│   │   │   └── "Manage Your YouTube Sponsorships"
│   │   ├── Authentication Form
│   │   │   ├── Email Input Field
│   │   │   │   ├── Icon
│   │   │   │   ├── Placeholder Text
│   │   │   │   └── Validation Indicator
│   │   │   ├── Password Input Field
│   │   │   │   ├── Icon
│   │   │   │   ├── Show/Hide Toggle
│   │   │   │   └── Validation Indicator
│   │   │   ├── Remember Me Checkbox
│   │   │   ├── Forgot Password Link
│   │   │   └── Sign In Button
│   │   │       ├── Loading State
│   │   │       └── Success Animation
│   │   ├── Divider
│   │   │   └── "OR"
│   │   ├── Social Login Options
│   │   │   ├── Continue with Google
│   │   │   └── Continue with YouTube
│   │   └── Sign Up Link
│   │       └── "New to SponsorFlow? Create Account"
│   └── Footer
│       ├── Privacy Policy Link
│       ├── Terms of Service Link
│       └── Support Link

├── 3. Dashboard Page Structure
│   ├── Header
│   │   ├── Left Section
│   │   │   ├── App Logo
│   │   │   └── Dashboard Title
│   │   ├── Center Section
│   │   │   ├── Global Search Bar
│   │   │   │   ├── Search Icon
│   │   │   │   ├── Input Field
│   │   │   │   └── Clear Button
│   │   │   └── Quick Filters
│   │   │       ├── Active Deals
│   │   │       ├── Due This Week
│   │   │       └── High Priority
│   │   └── Right Section
│   │       ├── Add New Deal Button
│   │       │   └── Plus Icon
│   │       ├── Notifications Bell
│   │       │   ├── Badge Counter
│   │       │   └── Dropdown Menu
│   │       └── User Profile
│   │           ├── Avatar
│   │           ├── User Name
│   │           └── Dropdown Menu
│   │               ├── Profile Settings
│   │               ├── Analytics
│   │               ├── Help Center
│   │               └── Logout
│   ├── Toolbar
│   │   ├── View Controls
│   │   │   ├── Board View (Active)
│   │   │   ├── List View
│   │   │   └── Calendar View
│   │   ├── Filter Section
│   │   │   ├── Sponsor Type Dropdown
│   │   │   ├── Deal Value Range
│   │   │   ├── Date Range Picker
│   │   │   └── Clear Filters
│   │   └── Sort Options
│   │       ├── By Date Added
│   │       ├── By Deal Value
│   │       ├── By Priority
│   │       └── By Deadline
│   ├── Kanban Board Container
│   │   ├── Board Header
│   │   │   └── Active Deals Summary Stats
│   │   └── Kanban Columns
│   │       ├── Column 1: New Leads
│   │       │   ├── Column Header
│   │       │   │   ├── Stage Name
│   │       │   │   ├── Deal Count Badge
│   │       │   │   └── Column Actions Menu
│   │       │   └── Deal Cards Container
│   │       │       └── Deal Card Structure
│   │       │           ├── Card Header
│   │       │           │   ├── Sponsor Logo/Avatar
│   │       │           │   ├── Sponsor Name
│   │       │           │   └── Priority Indicator
│   │       │           ├── Deal Information
│   │       │           │   ├── Deal Value
│   │       │           │   ├── Product/Service Type
│   │       │           │   └── Video Topic
│   │       │           ├── Timeline
│   │       │           │   ├── Created Date
│   │       │           │   └── Due Date
│   │       │           ├── Progress Indicators
│   │       │           │   ├── Days in Stage
│   │       │           │   └── Urgency Status
│   │       │           └── Card Footer
│   │       │               ├── Assigned Creator
│   │       │               ├── Tags
│   │       │               └── Quick Actions
│   │       │                   ├── Edit
│   │       │                   ├── Comment
│   │       │                   └── Archive
│   │       ├── Column 2: Initial Contact
│   │       │   ├── Column Header
│   │       │   └── Deal Cards Container
│   │       ├── Column 3: Negotiation
│   │       │   ├── Column Header
│   │       │   └── Deal Cards Container
│   │       ├── Column 4: Contract Review
│   │       │   ├── Column Header
│   │       │   └── Deal Cards Container
│   │       ├── Column 5: Content Creation
│   │       │   ├── Column Header
│   │       │   └── Deal Cards Container
│   │       ├── Column 6: Review & Approval
│   │       │   ├── Column Header
│   │       │   └── Deal Cards Container
│   │       ├── Column 7: Publishing
│   │       │   ├── Column Header
│   │       │   └── Deal Cards Container
│   │       ├── Column 8: Payment Pending
│   │       │   ├── Column Header
│   │       │   └── Deal Cards Container
│   │       └── Column 9: Completed
│   │           ├── Column Header
│   │           └── Deal Cards Container
│   └── Footer
│       ├── Statistics Bar
│       │   ├── Total Active Deals
│       │   ├── Total Deal Value
│       │   ├── Completion Rate
│       │   └── Average Deal Duration
│       └── Quick Links
│           ├── Export Data
│           ├── View Analytics
│           └── Manage Templates

└── 4. "Add New Deal" Modal Structure
    ├── Modal Overlay
    │   └── Dark Background with Blur Effect
    ├── Modal Container
    │   ├── Modal Header
    │   │   ├── Title "Add New Sponsorship Deal"
    │   │   └── Close Button (X)
    │   ├── Modal Body
    │   │   ├── Form Section 1: Sponsor Information
    │   │   │   ├── Sponsor Name Input
    │   │   │   │   ├── Label
    │   │   │   │   ├── Required Indicator
    │   │   │   │   └── Text Input
    │   │   │   ├── Company/Brand Input
    │   │   │   │   └── Text Input with Autocomplete
    │   │   │   ├── Contact Person Input
    │   │   │   │   └── Text Input
    │   │   │   └── Contact Email Input
    │   │   │       └── Email Input with Validation
    │   │   ├── Form Section 2: Deal Details
    │   │   │   ├── Deal Type Dropdown
    │   │   │   │   ├── Product Placement
    │   │   │   │   ├── Dedicated Video
    │   │   │   │   ├── Integration
    │   │   │   │   └── Series Partnership
    │   │   │   ├── Deal Value Input
    │   │   │   │   ├── Currency Selector
    │   │   │   │   └── Amount Input
    │   │   │   ├── Product/Service Description
    │   │   │   │   └── Textarea
    │   │   │   └── Special Requirements
    │   │   │       └── Textarea
    │   │   ├── Form Section 3: Timeline
    │   │   │   ├── Start Date Picker
    │   │   │   │   └── Calendar Widget
    │   │   │   ├── Content Due Date Picker
    │   │   │   │   └── Calendar Widget
    │   │   │   ├── Publish Date Picker
    │   │   │   │   └── Calendar Widget
    │   │   │   └── Payment Terms
    │   │   │       └── Dropdown Select
    │   │   ├── Form Section 4: Content Details
    │   │   │   ├── Video Topic/Title
    │   │   │   │   └── Text Input
    │   │   │   ├── Video Length
    │   │   │   │   └── Duration Selector
    │   │   │   ├── Platform Selection
    │   │   │   │   ├── YouTube Main Channel
    │   │   │   │   ├── YouTube Shorts
    │   │   │   │   └── Other Platforms
    │   │   │   └── Content Guidelines Upload
    │   │   │       └── File Upload Area
    │   │   └── Form Section 5: Additional Options
    │   │       ├── Priority Level
    │   │       │   ├── Low
    │   │       │   ├── Medium
    │   │       │   └── High
    │   │       ├── Assign Team Member
    │   │       │   └── Dropdown with User List
    │   │       ├── Tags Input
    │   │       │   └── Multi-select with Custom Tags
    │   │       └── Initial Notes
    │   │           └── Rich Text Editor
    │   └── Modal Footer
    │       ├── Cancel Button
    │       ├── Save as Draft Button
    │       └── Create Deal Button
    │           └── Loading State
```
