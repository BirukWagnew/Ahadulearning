// Category-specific images utility - shared across all components
export const getCategoryImage = (category) => {
  const categoryLower = category.toLowerCase();

  // Debug log to check category
  console.log('Category:', categoryLower);

  if (categoryLower.includes('programming') || categoryLower.includes('code')) {
    console.log('Using programming image');
    return "https://th.bing.com/th/id/R.7e6980c76a3a36775271a59670f19c61?rik=ayfCJl5Wugr2sg&pid=ImgRaw&r=0";
  } else if (categoryLower.includes('web') || categoryLower.includes('development')) {
    console.log('Using web development image');
    return "https://th.bing.com/th/id/R.8561e4df338b0e8d53c339e3d8d779f2?rik=EZx2yrdpip0WXA&pid=ImgRaw&r=0";
  } else if (categoryLower.includes('computer science') || categoryLower.includes('computer')) {
    console.log('Using computer science image');
    return "https://1.bp.blogspot.com/-WkLaijQn9Io/Xe-b02-c9zI/AAAAAAAAEPI/qKqXwEZ-KEUq1NjfuzrTQlhXKLqvSVzxQCLcBGAsYHQ/w1200-h630-p-k-no-nu/computer%2Bscience.jpg";
  } else if (categoryLower.includes('business')) {
    console.log('Using business image');
    return "https://tse3.mm.bing.net/th/id/OIP.qkOhculxgOeQ-pk8AVikkwHaDG?rs=1&pid=ImgDetMain&o=7&rm=3";
  } else if (categoryLower.includes('marketing')) {
    console.log('Using marketing image');
    return "https://th.bing.com/th/id/R.6048b4f3d38d05b063f4a510ff3c7d09?rik=M%2f7UEDNOak8Z4Q&pid=ImgRaw&r=0";
  } else if (categoryLower.includes('data science') || categoryLower.includes('data') || categoryLower.includes('datascience') || categoryLower.includes('datascinec')) {
    console.log('Using data science image');
    return "https://tse4.mm.bing.net/th/id/OIP.O0LhiSUD9RRL9_Anb-hkkAHaEo?rs=1&pid=ImgDetMain&o=7&rm=3";
  } else if (categoryLower.includes('psychology')) {
    console.log('Using psychology image');
    return "https://th.bing.com/th/id/OIP.o2uQdiKBZYzfYURwAtFIhQHaE_?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3";
  } else if (categoryLower.includes('finance')) {
    console.log('Using finance image');
    return "https://th.bing.com/th/id/R.6048b4f3d38d05b063f4a510ff3c7d09?rik=M%2f7UEDNOak8Z4Q&pid=ImgRaw&r=0";
  } else if (categoryLower.includes('design') || categoryLower.includes('ui') || categoryLower.includes('ux') || categoryLower.includes('desin')) {
    console.log('Using design image');
    return "https://tse2.mm.bing.net/th/id/OIP.MxwH4-RTAe0hTqlbzd8KtAHaD4?rs=1&pid=ImgDetMain&o=7&rm=3";
  } else if (categoryLower.includes('language') || categoryLower.includes('languages') || categoryLower.includes('speaking') || categoryLower.includes('lang')) {
    console.log('Using language image');
    return "https://tse4.mm.bing.net/th/id/OIP.Lf9Ok8FwPZsImGn-N7FaEQHaE8?rs=1&pid=ImgDetMain&o=7&rm=3";
  } else if (categoryLower.includes('health') || categoryLower.includes('fitness') || categoryLower.includes('helth')) {
    console.log('Using health & fitness image');
    return "https://th.bing.com/th/id/R.0641b8f848a03aba0a3c192b486aea5d?rik=L9xpoqDCv5gfnA&pid=ImgRaw&r=0";
  } else if (categoryLower.includes('mathematics') || categoryLower.includes('math') || categoryLower.includes('maths')) {
    console.log('Using mathematics image');
    return "https://tse2.mm.bing.net/th/id/OIP.F561bcLwdZYCEXHQMSYssgHaDt?rs=1&pid=ImgDetMain&o=7&rm=3";
  } else if (categoryLower.includes('photography') || categoryLower.includes('photo') || categoryLower.includes('photografy')) {
    console.log('Using photography image');
    return "https://tse3.mm.bing.net/th/id/OIP.MYBXwqjBG1K3zIggNQN53QHaEK?rs=1&pid=ImgDetMain&o=7&rm=3";
  } else if (categoryLower.includes('music') || categoryLower.includes('audio') || categoryLower.includes('musik')) {
    console.log('Using music image');
    return "https://tse4.mm.bing.net/th/id/OIP.ed586thprlSXgRgIak8A4AHaFP?rs=1&pid=ImgDetMain&o=7&rm=3";
  } else {
    console.log('Using default image - category not matched:', categoryLower);
    // Default fallback image
    return "https://images.unsplash.com/photo-1524178232393-3dcfa7c3893d?w=400&h=300&fit=crop";
  }
};
