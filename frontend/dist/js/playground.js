
import * as state from './state.js';

// Resource definitions and rules
const RESOURCE_RULES = {
    "Root": {
        allowedChildren: ["VPC", "S3", "Lambda", "IAM_Role"],
        icon: "📁"
    },
    "VPC": {
        allowedChildren: ["Subnet", "SecurityGroup", "InternetGateway", "NATGateway", "RouteTable", "ALB", "RDS"],
        icon: "🌐",
        color: "#3fb950"
    },
    "Subnet": {
        allowedChildren: ["EC2", "Lambda", "NATGateway"],
        icon: "📡",
        color: "#2f81f7"
    },
    "EC2": {
        allowedChildren: [],
        icon: "💻",
        color: "#d29922"
    },
    "RDS": {
        allowedChildren: [],
        icon: "🗄️",
        color: "#8b949e",
        multipleParents: true // RDS needs DB Subnet Group with multiple subnets
    },
    "S3": {
        allowedChildren: [],
        icon: "🪣",
        color: "#3fb950"
    },
    "Lambda": {
        allowedChildren: [],
        icon: "λ",
        color: "#f85149"
    },
    "SecurityGroup": {
        allowedChildren: [],
        icon: "🔒",
        color: "#58a6ff"
    },
    "ALB": {
        allowedChildren: [],
        icon: "⚖️",
        color: "#ff6b6b",
        multipleParents: true // ALB can attach to multiple subnets
    },
    "InternetGateway": {
        allowedChildren: [],
        icon: "🌍",
        color: "#4ecdc4"
    },
    "NATGateway": {
        allowedChildren: [],
        icon: "🔄",
        color: "#95e1d3"
    },
    "RouteTable": {
        allowedChildren: [],
        icon: "🗺️",
        color: "#f38181"
    },
    "IAM_Role": {
        allowedChildren: [],
        icon: "👤",
        color: "#aa96da"
    }
};

// Property forms for each resource type (AWS-accurate)
const PROPERTY_FORMS = {
    VPC: [
        {
            name: "name", label: "Name", type: "text", required: true, placeholder: "production-vpc",
            pattern: "^[a-zA-Z0-9-_]+$", patternMessage: "Only letters, numbers, hyphens and underscores allowed"
        },
        {
            name: "cidr_block", label: "IPv4 CIDR Block", type: "text", required: true, placeholder: "10.0.0.0/16",
            help: "The IPv4 network range in CIDR notation (e.g., 10.0.0.0/16)",
            pattern: "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\\/(1[6-9]|2[0-8]))$",
            patternMessage: "Invalid CIDR format. Example: 10.0.0.0/16 (must be /16 to /28)"
        },
        { name: "enable_dns_hostnames", label: "Enable DNS Hostnames", type: "checkbox", default: true },
        { name: "enable_dns_support", label: "Enable DNS Resolution", type: "checkbox", default: true },
        {
            name: "instance_tenancy", label: "Tenancy", type: "select", default: "default", options: [
                { value: "default", label: "Default" },
                { value: "dedicated", label: "Dedicated" }
            ]
        }
    ],

    Subnet: [
        {
            name: "name", label: "Name", type: "text", required: true, placeholder: "public-subnet-1a",
            pattern: "^[a-zA-Z0-9-_]+$", patternMessage: "Only letters, numbers, hyphens and underscores allowed"
        },
        {
            name: "cidr_block", label: "IPv4 CIDR Block", type: "text", required: true, placeholder: "10.0.1.0/24",
            help: "Must be a subset of VPC CIDR block",
            pattern: "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\\/(1[6-9]|2[0-8]))$",
            patternMessage: "Invalid CIDR format. Example: 10.0.1.0/24"
        },
        {
            name: "availability_zone", label: "Availability Zone", type: "select", required: true, options: [
                { value: "us-east-1a", label: "us-east-1a" },
                { value: "us-east-1b", label: "us-east-1b" },
                { value: "us-east-1c", label: "us-east-1c" },
                { value: "us-east-1d", label: "us-east-1d" },
                { value: "us-east-1e", label: "us-east-1e" },
                { value: "us-east-1f", label: "us-east-1f" }
            ]
        },
        {
            name: "map_public_ip_on_launch", label: "Auto-assign Public IPv4", type: "checkbox", default: false,
            help: "Automatically assign a public IP to instances launched in this subnet"
        }
    ],

    EC2: [
        {
            name: "name", label: "Name", type: "text", required: true, placeholder: "web-server-1",
            pattern: "^[a-zA-Z0-9-_]+$", patternMessage: "Only letters, numbers, hyphens and underscores allowed"
        },
        {
            name: "instance_type", label: "Instance Type", type: "select", required: true, options: [
                { value: "t2.micro", label: "t2.micro (1 vCPU, 1 GB RAM) - Free tier" },
                { value: "t2.small", label: "t2.small (1 vCPU, 2 GB RAM)" },
                { value: "t2.medium", label: "t2.medium (2 vCPU, 4 GB RAM)" },
                { value: "t3.micro", label: "t3.micro (2 vCPU, 1 GB RAM)" },
                { value: "t3.small", label: "t3.small (2 vCPU, 2 GB RAM)" },
                { value: "t3.medium", label: "t3.medium (2 vCPU, 4 GB RAM)" }
            ]
        },
        {
            name: "ami", label: "AMI ID", type: "text", required: true, placeholder: "ami-0c55b159cbfafe1f0",
            help: "Amazon Machine Image ID (varies by region)",
            pattern: "^ami-[a-f0-9]{8,17}$",
            patternMessage: "Invalid AMI ID format. Must start with 'ami-' followed by 8-17 hex characters"
        },
        {
            name: "key_name", label: "Key Pair Name (Optional)", type: "text", placeholder: "my-key-pair",
            pattern: "^[a-zA-Z0-9-_]*$", patternMessage: "Only letters, numbers, hyphens and underscores allowed"
        },
        { name: "monitoring", label: "Enable Detailed Monitoring", type: "checkbox", default: false }
    ],

    RDS: [
        {
            name: "name", label: "DB Instance Identifier", type: "text", required: true, placeholder: "mydb-instance",
            help: "Unique name for this DB instance",
            pattern: "^[a-z][a-z0-9-]{0,62}$",
            patternMessage: "Must start with a letter, only lowercase letters, numbers and hyphens, max 63 chars"
        },
        {
            name: "subnet_ids", label: "Subnets (Select at least 2)", type: "multi-select", required: true,
            help: "RDS requires a DB Subnet Group with at least 2 subnets in different AZs",
            dynamicOptions: "subnets"
        },
        {
            name: "engine", label: "Database Engine", type: "select", required: true, options: [
                { value: "mysql", label: "MySQL" },
                { value: "postgres", label: "PostgreSQL" },
                { value: "mariadb", label: "MariaDB" },
                { value: "oracle-se2", label: "Oracle SE2" },
                { value: "sqlserver-ex", label: "SQL Server Express" }
            ]
        },
        {
            name: "engine_version", label: "Engine Version", type: "text", placeholder: "8.0.35",
            pattern: "^[0-9]+\\.[0-9]+(\\.[0-9]+)?$", patternMessage: "Invalid version format. Example: 8.0.35"
        },
        {
            name: "instance_class", label: "DB Instance Class", type: "select", required: true, options: [
                { value: "db.t3.micro", label: "db.t3.micro (2 vCPU, 1 GB RAM)" },
                { value: "db.t3.small", label: "db.t3.small (2 vCPU, 2 GB RAM)" },
                { value: "db.t3.medium", label: "db.t3.medium (2 vCPU, 4 GB RAM)" },
                { value: "db.t4g.micro", label: "db.t4g.micro (2 vCPU, 1 GB RAM) - ARM" }
            ]
        },
        {
            name: "allocated_storage", label: "Allocated Storage (GB)", type: "text", required: true, placeholder: "20",
            pattern: "^[0-9]+$", min: "20", max: "65536", patternMessage: "Must be a number between 20 and 65536"
        },
        {
            name: "username", label: "Master Username", type: "text", required: true, placeholder: "admin",
            pattern: "^[a-zA-Z][a-zA-Z0-9_]{0,15}$", patternMessage: "Must start with a letter, max 16 chars, only letters, numbers and underscores"
        },
        { name: "multi_az", label: "Multi-AZ Deployment", type: "checkbox", default: false }
    ],

    S3: [
        {
            name: "bucket_name", label: "Bucket Name", type: "text", required: true, placeholder: "my-unique-bucket-name-12345",
            help: "Must be globally unique across all of AWS",
            pattern: "^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$",
            patternMessage: "Must be 3-63 chars, lowercase letters, numbers and hyphens only, cannot start/end with hyphen"
        },
        { name: "versioning", label: "Enable Versioning", type: "checkbox", default: false },
        { name: "encryption", label: "Enable Server-Side Encryption", type: "checkbox", default: true }
    ],

    Lambda: [
        {
            name: "function_name", label: "Function Name", type: "text", required: true, placeholder: "ProcessData",
            pattern: "^[a-zA-Z0-9-_]{1,64}$", patternMessage: "Max 64 chars, letters, numbers, hyphens and underscores only"
        },
        {
            name: "runtime", label: "Runtime", type: "select", required: true, options: [
                { value: "python3.9", label: "Python 3.9" },
                { value: "python3.10", label: "Python 3.10" },
                { value: "python3.11", label: "Python 3.11" },
                { value: "python3.12", label: "Python 3.12" },
                { value: "nodejs18.x", label: "Node.js 18" },
                { value: "nodejs20.x", label: "Node.js 20" },
                { value: "java17", label: "Java 17" },
                { value: "go1.x", label: "Go 1.x" }
            ]
        },
        {
            name: "handler", label: "Handler", type: "text", required: true, placeholder: "index.handler",
            help: "The function entrypoint in your code",
            pattern: "^[a-zA-Z0-9_./\\-]+$", patternMessage: "Invalid handler format"
        },
        {
            name: "memory_size", label: "Memory (MB)", type: "select", required: true, options: [
                { value: "128", label: "128 MB" },
                { value: "256", label: "256 MB" },
                { value: "512", label: "512 MB" },
                { value: "1024", label: "1024 MB (1 GB)" },
                { value: "2048", label: "2048 MB (2 GB)" },
                { value: "3008", label: "3008 MB (3 GB)" }
            ]
        },
        {
            name: "timeout", label: "Timeout (seconds)", type: "text", required: true, placeholder: "30",
            pattern: "^[0-9]+$", min: "1", max: "900", patternMessage: "Must be a number between 1 and 900 seconds"
        }
    ],

    SecurityGroup: [
        {
            name: "name", label: "Security Group Name", type: "text", required: true, placeholder: "web-server-sg",
            pattern: "^[a-zA-Z0-9-_]+$", patternMessage: "Only letters, numbers, hyphens and underscores allowed"
        },
        {
            name: "description", label: "Description", type: "text", required: true, placeholder: "Security group for web servers",
            help: "Cannot be changed after creation"
        }
    ],

    ALB: [
        {
            name: "name", label: "Load Balancer Name", type: "text", required: true, placeholder: "my-load-balancer",
            pattern: "^[a-zA-Z0-9-]{1,32}$", patternMessage: "Max 32 chars, letters, numbers and hyphens only"
        },
        {
            name: "internal", label: "Internal Load Balancer", type: "checkbox", default: false,
            help: "If checked, the load balancer is only accessible within VPC"
        },
        {
            name: "subnet_ids", label: "Subnets (Select Multiple)", type: "multi-select", required: true,
            help: "ALB requires at least 2 subnets in different AZs",
            dynamicOptions: "subnets"
        } // Will populate from existing subnets
    ],

    InternetGateway: [
        {
            name: "name", label: "Name", type: "text", required: true, placeholder: "main-igw",
            pattern: "^[a-zA-Z0-9-_]+$", patternMessage: "Only letters, numbers, hyphens and underscores allowed"
        }
    ],

    NATGateway: [
        {
            name: "name", label: "Name", type: "text", required: true, placeholder: "nat-gateway-1a",
            pattern: "^[a-zA-Z0-9-_]+$", patternMessage: "Only letters, numbers, hyphens and underscores allowed"
        },
        {
            name: "connectivity_type", label: "Connectivity Type", type: "select", required: true, options: [
                { value: "public", label: "Public (default)" },
                { value: "private", label: "Private" }
            ]
        }
    ],

    RouteTable: [
        {
            name: "name", label: "Name", type: "text", required: true, placeholder: "public-route-table",
            pattern: "^[a-zA-Z0-9-_]+$", patternMessage: "Only letters, numbers, hyphens and underscores allowed"
        }
    ],

    IAM_Role: [
        {
            name: "name", label: "Role Name", type: "text", required: true, placeholder: "lambda-execution-role",
            pattern: "^[a-zA-Z0-9+=,.@_-]{1,64}$", patternMessage: "Max 64 chars, alphanumeric and +=,.@_- only"
        },
        { name: "description", label: "Description", type: "text", placeholder: "Allows Lambda to access AWS services" }
    ]
};

// State
const InfrastructureBuilder = {
    resources: [],
    currentResourceType: null,
    currentParentId: null,
    contextMenuNode: null,
    currentPage: 1,
    fieldsPerPage: 4, // Show 4 fields per page
    currentFormData: {}, // Store form data across pages
    terraformContent: '', // Full terraform code
    currentTerraformPage: 1,
    terraformLinesPerPage: 50 // Show 50 lines per page in terraform modal
};

// Show playground
export async function showPlayground() {
    hideAllContainers();

    const playgroundContainer = document.getElementById('playgroundContainer');
    if (playgroundContainer) {
        playgroundContainer.classList.remove('hidden');
    }

    state.statusText.textContent = 'Infrastructure Builder';

    // Hide view toggle buttons
    const viewToggle = document.querySelector('.view-toggle');
    if (viewToggle) {
        viewToggle.style.display = 'none';
    }

    // Initialize event listeners
    initEventListeners();

    // Render tree
    renderTree();
}

function hideAllContainers() {
    const containers = [
        'vpcGrid', 'vpcTable', 'ec2Table', 'ecsTable', 'subnetTable',
        'securityGroupTable', 'natTable', 'routeTable', 's3Table',
        'targetGroupTable', 'lbTable', 'eipTable', 'lambdaTable',
        'rdsTable', 'topologyContainer'
    ];

    containers.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.classList.add('hidden');
    });

    const viewToggle = document.querySelector('.view-toggle');
    if (viewToggle) viewToggle.style.display = 'flex';
}

function initEventListeners() {
    // Resource buttons
    document.querySelectorAll('.resource-btn').forEach(btn => {
        btn.onclick = () => {
            const resourceType = btn.getAttribute('data-type');
            openResourceModal(resourceType, null);
        };
    });

    // Clear tree button
    const clearBtn = document.getElementById('clearTreeBtn');
    if (clearBtn) {
        clearBtn.onclick = () => {
            if (confirm('Are you sure you want to clear all resources?')) {
                InfrastructureBuilder.resources = [];
                renderTree();
            }
        };
    }

    // Generate Terraform button
    const generateBtn = document.getElementById('generateTerraformBtn');
    if (generateBtn) {
        generateBtn.onclick = () => generateTerraform();
    }

    // Modal close buttons
    const closeResourceModal = document.getElementById('closeResourceModal');
    if (closeResourceModal) {
        closeResourceModal.onclick = () => closeModal('resourceModal');
    }

    const closeTerraformModal = document.getElementById('closeTerraformModal');
    if (closeTerraformModal) {
        closeTerraformModal.onclick = () => closeModal('terraformModal');
    }

    const cancelBtn = document.getElementById('cancelResourceBtn');
    if (cancelBtn) {
        cancelBtn.onclick = () => closeModal('resourceModal');
    }

    const saveBtn = document.getElementById('saveResourceBtn');
    if (saveBtn) {
        saveBtn.onclick = () => saveResource();
    }

    // Pagination buttons
    const nextPageBtn = document.getElementById('nextPageBtn');
    if (nextPageBtn) {
        nextPageBtn.onclick = () => window.nextPage();
    }

    const prevPageBtn = document.getElementById('prevPageBtn');
    if (prevPageBtn) {
        prevPageBtn.onclick = () => window.prevPage();
    }

    // Copy terraform button
    const copyBtn = document.getElementById('copyTerraformBtn');
    if (copyBtn) {
        copyBtn.onclick = () => copyTerraform();
    }

    // Save terraform button
    const saveFileBtn = document.getElementById('saveFileTerraformBtn');
    if (saveFileBtn) {
        saveFileBtn.onclick = () => saveTerraformToFile();
    }

    // Terraform Pagination buttons
    const nextTerraformBtn = document.getElementById('nextTerraformPageBtn');
    if (nextTerraformBtn) {
        nextTerraformBtn.onclick = () => window.nextTerraformPage();
    }

    const prevTerraformBtn = document.getElementById('prevTerraformPageBtn');
    if (prevTerraformBtn) {
        prevTerraformBtn.onclick = () => window.prevTerraformPage();
    }

    const closeTerraformFooterBtn = document.getElementById('closeTerraformFooterBtn');
    if (closeTerraformFooterBtn) {
        closeTerraformFooterBtn.onclick = () => closeModal('terraformModal');
    }

    // Close modal on background click
    ['resourceModal', 'terraformModal'].forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.onclick = (e) => {
                if (e.target === modal) closeModal(modalId);
            };
        }
    });
}

function openResourceModal(resourceType, parentId = null) {
    InfrastructureBuilder.currentResourceType = resourceType;
    InfrastructureBuilder.currentParentId = parentId;
    InfrastructureBuilder.currentPage = 1;
    InfrastructureBuilder.currentFormData = {}; // Reset form data

    const modal = document.getElementById('resourceModal');
    const title = document.getElementById('modalTitle');

    title.textContent = `Add ${resourceType}`;

    // Generate and display first page
    renderFormPage();

    modal.classList.remove('hidden');
}

function renderFormPage() {
    const form = document.getElementById('resourceForm');
    const fields = PROPERTY_FORMS[InfrastructureBuilder.currentResourceType] || [];
    const totalPages = Math.ceil(fields.length / InfrastructureBuilder.fieldsPerPage);
    const currentPage = InfrastructureBuilder.currentPage;

    // Calculate which fields to show
    const startIdx = (currentPage - 1) * InfrastructureBuilder.fieldsPerPage;
    const endIdx = startIdx + InfrastructureBuilder.fieldsPerPage;
    const pageFields = fields.slice(startIdx, endIdx);

    // Render fields for current page
    form.innerHTML = pageFields.map(field => generateFormField(field)).join('');

    // Restore previously saved values
    pageFields.forEach(field => {
        const savedValue = InfrastructureBuilder.currentFormData[field.name];
        if (savedValue !== undefined) {
            const input = form.querySelector(`[name="${field.name}"]`);
            if (input) {
                if (input.type === 'checkbox' && !input.closest('.multi-select-container')) {
                    input.checked = savedValue;
                } else if (field.type === 'multi-select') {
                    // Restore multi-select checkboxes
                    if (Array.isArray(savedValue)) {
                        savedValue.forEach(val => {
                            const checkbox = form.querySelector(`[name="${field.name}"][value="${val}"]`);
                            if (checkbox) checkbox.checked = true;
                        });
                    }
                } else if (input.type !== 'checkbox') {
                    input.value = savedValue;
                }
            }
        }
    });

    // Update page indicator
    const pageIndicator = document.getElementById('pageIndicator');
    if (totalPages > 1) {
        pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
        pageIndicator.style.display = 'block';
    } else {
        pageIndicator.style.display = 'none';
    }

    // Update navigation buttons
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const saveBtn = document.getElementById('saveResourceBtn');

    if (totalPages > 1) {
        // Show/hide prev button
        if (currentPage > 1) {
            prevBtn.style.display = 'inline-block';
        } else {
            prevBtn.style.display = 'none';
        }

        // Show/hide next button and save button
        if (currentPage < totalPages) {
            nextBtn.style.display = 'inline-block';
            saveBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'none';
            saveBtn.style.display = 'inline-block';
        }
    } else {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
    }
}

// Save current page data before switching pages
function saveCurrentPageData() {
    const form = document.getElementById('resourceForm');
    if (!form) return;

    // Save text inputs and selects
    form.querySelectorAll('input[type="text"], select').forEach(input => {
        if (input.value) {
            InfrastructureBuilder.currentFormData[input.name] = input.value;
        }
    });

    // Save single checkboxes (not in multi-select)
    form.querySelectorAll('.checkbox-wrapper input[type="checkbox"]').forEach(checkbox => {
        InfrastructureBuilder.currentFormData[checkbox.name] = checkbox.checked;
    });

    // Save multi-select checkboxes
    const multiSelectFields = {};
    form.querySelectorAll('.multi-select-container input[type="checkbox"]').forEach(checkbox => {
        if (checkbox.checked) {
            if (!multiSelectFields[checkbox.name]) {
                multiSelectFields[checkbox.name] = [];
            }
            multiSelectFields[checkbox.name].push(checkbox.value);
        }
    });

    // Add multi-select to form data
    for (let [key, values] of Object.entries(multiSelectFields)) {
        InfrastructureBuilder.currentFormData[key] = values;
    }
}

window.nextPage = function () {
    saveCurrentPageData();
    InfrastructureBuilder.currentPage++;
    renderFormPage();
};

window.prevPage = function () {
    saveCurrentPageData();
    InfrastructureBuilder.currentPage--;
    renderFormPage();
};

function generateFormField(field) {
    const required = field.required ? 'required' : '';
    const requiredClass = field.required ? 'class="required"' : '';
    const helpText = field.help ? `<small>${field.help}</small>` : '';

    if (field.type === 'text') {
        const pattern = field.pattern ? `pattern="${field.pattern}"` : '';
        const title = field.patternMessage || '';
        const min = field.min ? `min="${field.min}"` : '';
        const max = field.max ? `max="${field.max}"` : '';

        return `
            <div class="form-group">
                <label ${requiredClass}>${field.label}</label>
                <input type="text" name="${field.name}" placeholder="${field.placeholder || ''}" 
                       ${required} ${pattern} ${min} ${max} title="${title}">
                ${helpText}
                ${field.patternMessage ? `<small class="pattern-hint">${field.patternMessage}</small>` : ''}
            </div>
        `;
    } else if (field.type === 'select') {
        const options = field.options.map(opt => {
            const value = typeof opt === 'string' ? opt : opt.value;
            const label = typeof opt === 'string' ? opt : opt.label;
            return `<option value="${value}">${label}</option>`;
        }).join('');
        return `
            <div class="form-group">
                <label ${requiredClass}>${field.label}</label>
                <select name="${field.name}" ${required}>
                    <option value="">Select...</option>
                    ${options}
                </select>
                ${helpText}
            </div>
        `;
    } else if (field.type === 'multi-select') {
        // Get dynamic options (e.g., existing subnets)
        let options = '';
        if (field.dynamicOptions === 'subnets') {
            const subnets = InfrastructureBuilder.resources.filter(r => r.type === 'Subnet');
            options = subnets.map(subnet => {
                const name = subnet.properties.name || subnet.id;
                const cidr = subnet.properties.cidr_block || '';
                const az = subnet.properties.availability_zone || '';
                return `
                    <div class="checkbox-item">
                        <input type="checkbox" name="${field.name}" value="${subnet.id}" id="${subnet.id}">
                        <label for="${subnet.id}">${name} (${cidr} - ${az})</label>
                    </div>
                `;
            }).join('');
        }

        if (!options) {
            options = '<p style="color: var(--text-muted); font-size: 12px;">No subnets available. Please create subnets first.</p>';
        }

        return `
            <div class="form-group">
                <label ${requiredClass}>${field.label}</label>
                <div class="multi-select-container">
                    ${options}
                </div>
                ${helpText}
            </div>
        `;
    } else if (field.type === 'checkbox') {
        const checked = field.default ? 'checked' : '';
        return `
            <div class="form-group">
                <div class="checkbox-wrapper">
                    <input type="checkbox" name="${field.name}" ${checked}>
                    <label>${field.label}</label>
                </div>
                ${helpText}
            </div>
        `;
    }
    return '';
}

function saveResource() {
    // Save current page data first
    saveCurrentPageData();

    // Use the accumulated form data from all pages
    const properties = { ...InfrastructureBuilder.currentFormData };

    // Validate
    const fields = PROPERTY_FORMS[InfrastructureBuilder.currentResourceType] || [];
    for (let field of fields) {
        if (field.required && !properties[field.name]) {
            alert(`${field.label} is required`);
            return;
        }
        // Validate multi-select has at least one selection
        if (field.type === 'multi-select' && field.required) {
            if (!properties[field.name] || properties[field.name].length === 0) {
                alert(`${field.label} - Please select at least one option`);
                return;
            }
        }
    }

    // Create resource
    const resource = {
        id: `${InfrastructureBuilder.currentResourceType.toLowerCase()}-${Date.now()}`,
        type: InfrastructureBuilder.currentResourceType,
        properties: properties,
        parent: InfrastructureBuilder.currentParentId,
        children: []
    };

    // Add to resources
    InfrastructureBuilder.resources.push(resource);

    // Update parent's children
    if (resource.parent) {
        const parent = InfrastructureBuilder.resources.find(r => r.id === resource.parent);
        if (parent) {
            parent.children.push(resource.id);
        }
    }

    closeModal('resourceModal');
    renderTree();
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

function renderTree() {
    const treeView = document.getElementById('infraTree');
    if (!treeView) return;

    if (InfrastructureBuilder.resources.length === 0) {
        treeView.innerHTML = `
            <div class="tree-empty">
                <span class="empty-icon">📁</span>
                <p>No resources yet. Click buttons above to add resources.</p>
            </div>
        `;
        return;
    }

    // Get root resources (no parent)
    const rootResources = InfrastructureBuilder.resources.filter(r => !r.parent);

    treeView.innerHTML = `<ul class="tree-root">${rootResources.map(r => renderNode(r)).join('')}</ul>`;
}

function renderNode(resource) {
    const icon = RESOURCE_RULES[resource.type]?.icon || '📦';
    const name = resource.properties.name || resource.properties.bucket_name || resource.properties.function_name || resource.type;
    const meta = getResourceMeta(resource);

    const children = InfrastructureBuilder.resources.filter(r => r.parent === resource.id);
    const hasChildren = children.length > 0;

    // Toggle button for expand/collapse
    const toggleBtn = hasChildren
        ? `<button class="node-toggle" onclick="window.toggleNode(event, '${resource.id}')">▼</button>`
        : `<span class="node-toggle-spacer"></span>`;

    const childrenHtml = hasChildren
        ? `<ul class="tree-children" id="children-${resource.id}">${children.map(c => renderNode(c)).join('')}</ul>`
        : '';

    return `
        <li class="tree-node" data-id="${resource.id}">
            <div class="node-content" onclick="window.showContextMenu(event, '${resource.id}')">
                ${toggleBtn}
                <span class="node-icon">${icon}</span>
                <span class="node-label">${name}</span>
                ${meta ? `<span class="node-meta">${meta}</span>` : ''}
            </div>
            ${childrenHtml}
        </li>
    `;
}

function getResourceMeta(resource) {
    const props = resource.properties;
    switch (resource.type) {
        case 'VPC':
            return props.cidr_block || '';
        case 'Subnet':
            return props.cidr_block || '';
        case 'EC2':
            return props.instance_type || '';
        case 'RDS':
            return props.instance_class || '';
        default:
            return '';
    }
}

// Toggle node expand/collapse
window.toggleNode = function (event, resourceId) {
    event.stopPropagation();

    const childrenContainer = document.getElementById(`children-${resourceId}`);
    const toggleBtn = event.target;

    if (childrenContainer) {
        if (childrenContainer.classList.contains('collapsed')) {
            childrenContainer.classList.remove('collapsed');
            toggleBtn.textContent = '▼';
        } else {
            childrenContainer.classList.add('collapsed');
            toggleBtn.textContent = '▶';
        }
    }
};

// Context menu
window.showContextMenu = function (event, resourceId) {
    event.stopPropagation();
    event.preventDefault();

    const resource = InfrastructureBuilder.resources.find(r => r.id === resourceId);
    if (!resource) return;

    InfrastructureBuilder.contextMenuNode = resourceId;

    const allowedChildren = RESOURCE_RULES[resource.type]?.allowedChildren || [];

    let menuHtml = '<div class="context-menu" id="contextMenu" style="left: ' + event.pageX + 'px; top: ' + event.pageY + 'px;">';

    if (allowedChildren.length > 0) {
        allowedChildren.forEach(childType => {
            menuHtml += `<div class="menu-item" onclick="window.addChildResource('${childType}', '${resourceId}')">➕ Add ${childType}</div>`;
        });
        menuHtml += '<div class="menu-divider"></div>';
    }

    menuHtml += `
        <div class="menu-item" onclick="window.editResource('${resourceId}')">✏️ Edit Properties</div>
        <div class="menu-divider"></div>
        <div class="menu-item danger" onclick="window.deleteResource('${resourceId}')">🗑️ Delete</div>
    `;
    menuHtml += '</div>';

    // Remove existing context menu
    const existing = document.getElementById('contextMenu');
    if (existing) existing.remove();

    document.body.insertAdjacentHTML('beforeend', menuHtml);

    // Close menu on click outside
    setTimeout(() => {
        document.addEventListener('click', closeContextMenu);
    }, 10);
};

function closeContextMenu() {
    const menu = document.getElementById('contextMenu');
    if (menu) menu.remove();
    document.removeEventListener('click', closeContextMenu);
}

window.addChildResource = function (childType, parentId) {
    closeContextMenu();
    openResourceModal(childType, parentId);
};

window.editResource = function (resourceId) {
    closeContextMenu();
    // TODO: Implement edit functionality
    alert('Edit functionality coming soon!');
};

window.deleteResource = function (resourceId) {
    closeContextMenu();

    if (confirm('Are you sure you want to delete this resource and all its children?')) {
        // Remove resource and all children recursively
        function removeRecursive(id) {
            const resource = InfrastructureBuilder.resources.find(r => r.id === id);
            if (!resource) return;

            // Remove children first
            resource.children.forEach(childId => removeRecursive(childId));

            // Remove from parent's children array
            if (resource.parent) {
                const parent = InfrastructureBuilder.resources.find(r => r.id === resource.parent);
                if (parent) {
                    parent.children = parent.children.filter(cid => cid !== id);
                }
            }

            // Remove from resources
            InfrastructureBuilder.resources = InfrastructureBuilder.resources.filter(r => r.id !== id);
        }

        removeRecursive(resourceId);
        renderTree();
    }
};

async function generateTerraform() {
    if (InfrastructureBuilder.resources.length === 0) {
        console.log('Add some resources first!');
        // add popup to show message, but not alert()
        return;
    }

    try {
        // Call backend to generate Terraform code
        const resourcesJson = JSON.stringify(InfrastructureBuilder.resources);
        const terraformCode = await window.go.core.App.GenerateTerraform(resourcesJson);

        // Store full content and reset page
        InfrastructureBuilder.terraformContent = terraformCode;
        InfrastructureBuilder.currentTerraformPage = 1;

        // Render first page
        renderTerraformPage();
        document.getElementById('terraformModal').classList.remove('hidden');
    } catch (error) {
        console.error('Error generating Terraform:', error);
        alert('Error generating Terraform code: ' + error.message);
    }
}

function renderTerraformPage() {
    const codeContainer = document.getElementById('terraformCode');
    const fullCode = InfrastructureBuilder.terraformContent;
    const lines = fullCode.split('\n');
    const totalPages = Math.ceil(lines.length / InfrastructureBuilder.terraformLinesPerPage);
    const currentPage = InfrastructureBuilder.currentTerraformPage;

    // Calculate lines for current page
    const startIdx = (currentPage - 1) * InfrastructureBuilder.terraformLinesPerPage;
    const endIdx = startIdx + InfrastructureBuilder.terraformLinesPerPage;
    const pageLines = lines.slice(startIdx, endIdx);

    // Display lines
    codeContainer.textContent = pageLines.join('\n');

    // Update pagination info
    const pageIndicator = document.getElementById('terraformPageIndicator');
    if (totalPages > 1) {
        pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
        pageIndicator.parentElement.style.display = 'block';
    } else {
        pageIndicator.parentElement.style.display = 'none';
    }

    // Update buttons
    const prevBtn = document.getElementById('prevTerraformPageBtn');
    const nextBtn = document.getElementById('nextTerraformPageBtn');

    if (totalPages > 1) {
        prevBtn.style.display = currentPage > 1 ? 'inline-block' : 'none';
        nextBtn.style.display = currentPage < totalPages ? 'inline-block' : 'none';
    } else {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    }
}

window.nextTerraformPage = function () {
    InfrastructureBuilder.currentTerraformPage++;
    renderTerraformPage();
};

window.prevTerraformPage = function () {
    InfrastructureBuilder.currentTerraformPage--;
    renderTerraformPage();
};

async function saveTerraformToFile() {
    try {
        const content = InfrastructureBuilder.terraformContent;
        if (!content) return;

        const filename = await window.go.core.App.SaveTerraformFile(content);

        if (filename) {
            const btn = document.getElementById('saveFileTerraformBtn');
            const originalText = btn.textContent;
            btn.textContent = '✓ Saved!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        }
    } catch (error) {
        console.error('Error saving file:', error);
        alert('Failed to save file: ' + error.message);
    }
}

function copyTerraform() {
    const code = InfrastructureBuilder.terraformContent; // Copy ALL content, not just visible page
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.getElementById('copyTerraformBtn');
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
}
